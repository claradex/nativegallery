import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { GeoKind, parsePartialDate, vehiclePurposes, vehicleStatuses } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';
import { contentFromBody, entityFields, geoTree, vehicleColumns, vehicleSummaries, type VehicleRow } from './VehicleCatalog';

const invalid = (): never => { throw new BadRequestException(); };
const now = () => BigInt(Math.floor(Date.now() / 1000));

function optionalText(value: unknown, max: number) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || Buffer.byteLength(value) > max) invalid();
  return (value as string).trim() || null;
}

function optionalRef(value: unknown) {
  if (value === undefined || value === null || value === '' || value === '0') return null;
  return requireId(value, BadRequestException);
}

function optionalYear(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}$/.test(value) || Number(value) < 1800 || Number(value) > 2100) invalid();
  return Number(value);
}

function partialDate(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') invalid();
  const date = parsePartialDate(value as string);
  if (date === null) invalid();
  return date || null;
}

async function entityTemplate(id: number) {
  const entity = await database.entity.findUnique({ where: { id }, select: { sampledata: true } });
  if (!entity) throw new NotFoundException();
  return entityFields(entity.sampledata);
}

/** Admin catalog: models (`/api/admin/models/catalog`) and vehicles (`/api/admin/vehicles`). */
@Controller('api/admin')
export class AdminVehicleEditorController {
  constructor(private readonly auth: AuthService) {}

  /** The custom fields of an entity, with their scope (model or vehicle). */
  @Get('models/fields/:id')
  @Header('Cache-Control', 'private, no-store')
  async modelFields(@Req() request: Request, @Param('id') id: string) {
    await this.auth.requireAdmin(request, 'editor');
    return entityTemplate(requireId(id, BadRequestException));
  }

  /** Everything the model and vehicle forms pick from. */
  @Get('vehicles/options')
  @Header('Cache-Control', 'private, no-store')
  async options(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'editor');
    const [entities, models, places] = await Promise.all([
      database.entity.findMany({ select: { id: true, title: true, color: true }, orderBy: { id: 'asc' } }),
      database.entityModel.findMany({ select: { id: true, title: true, entityid: true, parent_id: true }, orderBy: { title: 'asc' } }),
      database.geoEntry.findMany({ where: { kind: { in: [GeoKind.City, GeoKind.Depot] } }, select: { id: true, title: true, kind: true, parent_id: true } }),
    ]);
    const cities = places.filter(place => place.kind === GeoKind.City);
    const geo = await geoTree(cities.map(city => city.id));
    return {
      entities, models,
      cities: cities.map(city => geo.city(city.id)!).sort((a, b) => a.title.localeCompare(b.title, 'ru')),
      depots: places.filter(place => place.kind === GeoKind.Depot).map(({ id, title, parent_id }) => ({ id, title, parent_id }))
        .sort((a, b) => a.title.localeCompare(b.title, 'ru')),
    };
  }

  // ——— Models ———

  @Get('models/catalog')
  @Header('Cache-Control', 'private, no-store')
  async models(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'editor');
    const rows = await database.$queryRaw<{ id: number; title: string; entityid: number; entity: string | null; color: string | null;
      manufacturer: string | null; parent_id: number | null; built_from: number | null; built_to: number | null; vehicles: bigint }[]>(Prisma.sql`
      SELECT m.id, m.title, m.entityid, e.title AS entity, e.color, m.manufacturer, m.parent_id, m.built_from, m.built_to,
        (SELECT COUNT(*) FROM entities_data v WHERE v.model_id = m.id) AS vehicles
      FROM entities_models m LEFT JOIN entities e ON e.id = m.entityid ORDER BY m.id DESC
    `);
    return rows.map(row => ({ ...row, entity: row.entity ?? '', color: row.color ?? '', vehicles: Number(row.vehicles) }));
  }

  @Get('models/catalog/:id')
  @Header('Cache-Control', 'private, no-store')
  async model(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const model = await database.entityModel.findUnique({ where: { id: requireId(rawId, BadRequestException) } });
    if (!model) throw new NotFoundException();
    const vehicles = await database.entityData.count({ where: { model_id: model.id } });
    return { ...model, createdate: Number(model.createdate), vehicles };
  }

  @Post('models/catalog')
  async createModel(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const entityid = requireId(body?.entityid, BadRequestException);
    const data = await this.modelData(entityid, null, body);
    return database.entityModel.create({ data: { ...data, entityid, createdate: now() }, select: { id: true } });
  }

  @Patch('models/catalog/:id')
  async updateModel(@Req() request: Request, @Param('id') rawId: string, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId, BadRequestException);
    const model = await database.entityModel.findUnique({ where: { id }, select: { entityid: true } });
    if (!model) throw new NotFoundException();
    await database.entityModel.update({ where: { id }, data: await this.modelData(model.entityid, id, body) });
    return { id };
  }

  @Delete('models/catalog/:id')
  async removeModel(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId, BadRequestException);
    await database.$transaction(async tx => {
      const [model] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM entities_models WHERE id = ${id} FOR UPDATE`);
      if (!model) throw new NotFoundException();
      if (await tx.entityData.findFirst({ where: { model_id: id }, select: { id: true } })) throw new ConflictException('К модели привязаны ТС.');
      if (await tx.entityModel.findFirst({ where: { parent_id: id }, select: { id: true } })) throw new ConflictException('У модели есть подмодели.');
      await tx.entityModel.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { id };
  }

  private async modelData(entityid: number, id: number | null, body: Record<string, unknown>) {
    const title = body?.title;
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 255) invalid();
    const parent_id = optionalRef(body.parent_id);
    if (parent_id) {
      // The parent must be a model of the same kind and not this model or one of its submodels.
      const seen = new Set<number>();
      for (let current: number | null = parent_id; current; ) {
        if (current === id || seen.has(current)) throw new BadRequestException('Модель не может быть подмоделью самой себя.');
        seen.add(current);
        const row: { entityid: number; parent_id: number | null } | null =
          await database.entityModel.findUnique({ where: { id: current }, select: { entityid: true, parent_id: true } });
        if (!row || (current === parent_id && row.entityid !== entityid)) invalid();
        current = row!.parent_id;
      }
    }
    const built_from = optionalYear(body.built_from), built_to = optionalYear(body.built_to);
    if (built_from && built_to && built_from > built_to) throw new BadRequestException('Год начала выпуска позже года окончания.');
    return {
      title: (title as string).trim(), parent_id, built_from, built_to,
      manufacturer: optionalText(body.manufacturer, 255), description: optionalText(body.description, 65535),
      content: contentFromBody(body, await entityTemplate(entityid), 'model', invalid),
    };
  }

  // ——— Vehicles ———

  /** Vehicles, newest first, narrowed by kind, model, city or a number/ID search; 100 per page. */
  @Get('vehicles')
  @Header('Cache-Control', 'private, no-store')
  async vehicles(@Req() request: Request, @Query() query: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const id = (key: string) => typeof query[key] === 'string' && /^\d{1,10}$/.test(query[key] as string) ? Number(query[key]) : null;
    const where: Prisma.Sql[] = [Prisma.sql`1 = 1`];
    if (id('entity')) where.push(Prisma.sql`v.entityid = ${id('entity')}`);
    if (id('model')) where.push(Prisma.sql`v.model_id = ${id('model')}`);
    if (id('city')) where.push(Prisma.sql`v.city_id = ${id('city')}`);
    const search = typeof query.q === 'string' ? query.q.trim().slice(0, 64) : '';
    if (search) {
      const like = '%' + search.replace(/[\\%_]/g, char => '\\' + char) + '%';
      where.push(Prisma.sql`(v.title LIKE ${like} OR v.factory_number LIKE ${like} OR v.comment LIKE ${like}
        ${/^\d+$/.test(search) ? Prisma.sql`OR v.id = ${Number(search)}` : Prisma.empty})`);
    }
    const page = Math.max(0, (id('page') ?? 1) - 1);
    const condition = Prisma.join(where, ' AND ');
    const [rows, [{ total }]] = await Promise.all([
      database.$queryRaw<VehicleRow[]>(Prisma.sql`
        SELECT ${vehicleColumns} FROM entities_data v WHERE ${condition} ORDER BY v.id DESC LIMIT 100 OFFSET ${page * 100}
      `),
      database.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT COUNT(*) AS total FROM entities_data v WHERE ${condition}`),
    ]);
    const entityIds = new Map(rows.map(row => [row.id, row.entityid]));
    return {
      total: Number(total), page: page + 1, pages: Math.max(1, Math.ceil(Number(total) / 100)),
      vehicles: (await vehicleSummaries(rows)).map(vehicle => ({ ...vehicle, entityid: entityIds.get(vehicle.id) ?? 0 })),
    };
  }

  @Get('vehicles/:id')
  @Header('Cache-Control', 'private, no-store')
  async vehicle(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const vehicle = await database.entityData.findUnique({ where: { id: requireId(rawId, BadRequestException) } });
    if (!vehicle) throw new NotFoundException();
    const photos = await database.photo.count({ where: { OR: [{ entitydata_id: vehicle.id },
      { id: { in: (await database.photoVehicle.findMany({ where: { entitydata_id: vehicle.id }, select: { photo_id: true } })).map(link => link.photo_id) } }] } });
    return { ...vehicle, createdate: Number(vehicle.createdate), photos };
  }

  @Post('vehicles')
  async createVehicle(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const entityid = requireId(body?.entityid, BadRequestException);
    const data = await this.vehicleData(entityid, body);
    return database.entityData.create({ data: { ...data, entityid, createdate: now() }, select: { id: true } });
  }

  @Patch('vehicles/:id')
  async updateVehicle(@Req() request: Request, @Param('id') rawId: string, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId, BadRequestException);
    const vehicle = await database.entityData.findUnique({ where: { id }, select: { entityid: true } });
    if (!vehicle) throw new NotFoundException();
    await database.entityData.update({ where: { id }, data: await this.vehicleData(vehicle.entityid, body) });
    return { id };
  }

  @Delete('vehicles/:id')
  async removeVehicle(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId, BadRequestException);
    await database.$transaction(async tx => {
      const [vehicle] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM entities_data WHERE id = ${id} FOR UPDATE`);
      if (!vehicle) throw new NotFoundException();
      if (await tx.photo.findFirst({ where: { entitydata_id: id }, select: { id: true } }) ||
          await tx.photoVehicle.findFirst({ where: { entitydata_id: id }, select: { id: true } })) throw new ConflictException('К ТС привязаны фотографии.');
      await tx.entityData.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { id };
  }

  private async vehicleData(entityid: number, body: Record<string, unknown>) {
    const title = body?.title;
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 64) invalid();
    const model_id = optionalRef(body.model_id), city_id = optionalRef(body.city_id), depot_id = optionalRef(body.depot_id);
    const [model, city, depot] = await Promise.all([
      model_id ? database.entityModel.findUnique({ where: { id: model_id }, select: { entityid: true } }) : null,
      city_id ? database.geoEntry.findUnique({ where: { id: city_id }, select: { kind: true } }) : null,
      depot_id ? database.geoEntry.findUnique({ where: { id: depot_id }, select: { kind: true, parent_id: true } }) : null,
    ]);
    if (model_id && model?.entityid !== entityid) throw new BadRequestException('Модель относится к другой сущности.');
    if (city_id && city?.kind !== GeoKind.City) throw new BadRequestException('Город не найден в GeoDB.');
    if (depot_id && (depot?.kind !== GeoKind.Depot || (city_id && depot.parent_id !== city_id))) {
      throw new BadRequestException('Депо не относится к выбранному городу.');
    }
    const status = Number(body.status ?? 1), purpose = Number(body.purpose ?? 0);
    if (!vehicleStatuses.some(item => item.id === status) || !vehiclePurposes.some(item => item.id === purpose)) invalid();
    return {
      title: (title as string).trim(), model_id, city_id, depot_id, status, purpose,
      factory_number: optionalText(body.factory_number, 64), vin: optionalText(body.vin, 64),
      built: partialDate(body.built), started: partialDate(body.started), retired: partialDate(body.retired), scrapped: partialDate(body.scrapped),
      comment: optionalText(body.comment, 65535),
      content: contentFromBody(body, await entityTemplate(entityid), 'vehicle', invalid),
    };
  }
}
