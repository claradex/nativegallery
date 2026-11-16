import { Controller, Get, Header, NotFoundException, Param, Query } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';
import {
  activeStatuses, listPageSize, listSorts, type GeoRef, type ListSort, type ModelPageData, type VehicleListData,
} from '@nativegallery/contracts';
import { requireId } from '../common/ids';
import { entityFields, fieldValues, geoDescendants, geoTree, vehicleColumns, vehicleSummaries, type VehicleRow } from './VehicleCatalog';

const optionalId = (value: unknown) =>
  typeof value === 'string' && /^\d{1,10}$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647 ? Number(value) : null;

/** A model and all its submodels, at any depth. */
async function withSubmodels(id: number) {
  const all = new Set([id]);
  let level = [id];
  for (let depth = 0; level.length && depth < 6; depth++) {
    level = (await database.entityModel.findMany({ where: { parent_id: { in: level } }, select: { id: true } }))
      .map(row => row.id).filter(child => !all.has(child));
    level.forEach(child => all.add(child));
  }
  return [...all];
}

/** Text partial dates sort naturally; empty ones go last. */
const orderBy: Record<ListSort, Prisma.Sql> = {
  zn: Prisma.sql`v.factory_number IS NULL OR v.factory_number = '', LENGTH(v.factory_number), v.factory_number, v.id`,
  num: Prisma.sql`LENGTH(v.title), v.title, v.id`,
  built: Prisma.sql`v.built IS NULL OR v.built = '', v.built, v.id`,
  start: Prisma.sql`v.started IS NULL OR v.started = '', v.started, v.id`,
  leave: Prisma.sql`v.retired IS NULL OR v.retired = '', v.retired, v.id`,
  scrap: Prisma.sql`v.scrapped IS NULL OR v.scrapped = '', v.scrapped, v.id`,
};

@Controller('api/internal')
export class ModelController {
  /** `/model/:id`: the model page shared by every city and country. `sub=1` counts its submodels too. */
  @Get('model/:id')
  @Header('Cache-Control', 'no-store')
  async model(@Param('id') rawId: string, @Query('sub') sub: unknown): Promise<ModelPageData> {
    const id = requireId(rawId);
    const model = await database.entityModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException();
    const withSub = sub === '1';
    const ids = withSub ? await withSubmodels(id) : [id];
    const [entity, parent, children, cities, photos] = await Promise.all([
      database.entity.findUnique({ where: { id: model.entityid }, select: { id: true, title: true, color: true, sampledata: true } }),
      model.parent_id ? database.entityModel.findUnique({ where: { id: model.parent_id }, select: { id: true, title: true } }) : null,
      database.entityModel.findMany({ where: { parent_id: id }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      database.$queryRaw<{ city_id: number | null; total: bigint; active: bigint }[]>(Prisma.sql`
        SELECT city_id, COUNT(*) AS total, SUM(status IN (${Prisma.join(activeStatuses)})) AS active
        FROM entities_data WHERE model_id IN (${Prisma.join(ids)}) GROUP BY city_id
      `),
      database.$queryRaw<{ id: number; photourl: string }[]>(Prisma.sql`
        SELECT p.id, p.photourl FROM photos p JOIN entities_data v ON v.id = p.entitydata_id
        WHERE v.model_id IN (${Prisma.join(ids)}) AND p.moderated = 1 ORDER BY p.id DESC LIMIT 3
      `),
    ]);
    const childCounts = children.length ? await database.entityData.groupBy({
      by: ['model_id'], where: { model_id: { in: children.map(child => child.id) } }, _count: { _all: true },
    }) : [];

    const geo = await geoTree(cities.map(row => row.city_id));
    const countries = new Map<number, ModelPageData['countries'][number]>();
    for (const row of cities) {
      const country = geo.country(row.city_id);
      const key = country?.id ?? 0;
      const group = countries.get(key) ?? { country, total: 0, active: 0, cities: [] };
      const total = Number(row.total), active = Number(row.active ?? 0);
      group.cities.push({ city: geo.ref(row.city_id), total, active });
      group.total += total; group.active += active;
      countries.set(key, group);
    }
    const byTitle = (a: GeoRef | null, b: GeoRef | null) => !a ? 1 : !b ? -1 : a.title.localeCompare(b.title, 'ru');
    const groups = [...countries.values()].sort((a, b) => byTitle(a.country, b.country));
    groups.forEach(group => group.cities.sort((a, b) => byTitle(a.city, b.city)));

    return {
      id, title: model.title, manufacturer: model.manufacturer ?? '', builtFrom: model.built_from, builtTo: model.built_to,
      description: model.description ?? '',
      entity: { id: model.entityid, title: entity?.title ?? '', color: entity?.color ?? '' },
      parent, children: children.map(child => ({ ...child, vehicles: childCounts.find(row => row.model_id === child.id)?._count._all ?? 0 })),
      fields: fieldValues(model.content, entityFields(entity?.sampledata), 'model'),
      photos, countries: groups,
      total: groups.reduce((sum, group) => sum + group.total, 0), active: groups.reduce((sum, group) => sum + group.active, 0),
      withSubmodels: withSub,
    };
  }

  /**
   * `/list?mid=…`: vehicles across every city and country, narrowed by model (`mid`), country (`rid`), city (`cid`)
   * or depot (`did`), and by purpose (`serv`). 500 per page (`st` is the offset), like transphoto.
   */
  @Get('list')
  @Header('Cache-Control', 'no-store')
  async list(@Query() query: Record<string, unknown>): Promise<VehicleListData> {
    const mid = optionalId(query.mid), rid = optionalId(query.rid), cid = optionalId(query.cid), did = optionalId(query.did);
    if (!mid && !rid && !cid && !did) throw new NotFoundException();
    const purpose = typeof query.serv === 'string' && /^[0-3]$/.test(query.serv) ? Number(query.serv) : null;
    const sort = listSorts.find(item => item.id === query.sort)?.id ?? 'zn';
    const offset = typeof query.st === 'string' && /^\d{1,7}$/.test(query.st) ? Number(query.st) : 0;

    const [model, places] = await Promise.all([
      mid ? database.entityModel.findUnique({ where: { id: mid }, select: { id: true, title: true, entityid: true } }) : null,
      database.geoEntry.findMany({ where: { id: { in: [rid, cid, did].filter((id): id is number => !!id) } }, select: { id: true, title: true } }),
    ]);
    const place = (id: number | null) => id ? places.find(row => row.id === id) ?? null : null;
    const country = place(rid), city = place(cid), depot = place(did);
    if ((mid && !model) || (rid && !country) || (cid && !city) || (did && !depot)) throw new NotFoundException();

    const where: Prisma.Sql[] = [];
    if (mid) where.push(Prisma.sql`v.model_id IN (${Prisma.join(query.sub === '0' ? [mid] : await withSubmodels(mid))})`);
    if (rid) where.push(Prisma.sql`v.city_id IN (${Prisma.join(await geoDescendants(rid))})`);
    if (cid) where.push(Prisma.sql`v.city_id = ${cid}`);
    if (did) where.push(Prisma.sql`v.depot_id = ${did}`);
    if (purpose !== null) where.push(Prisma.sql`v.purpose = ${purpose}`);
    const condition = Prisma.join(where, ' AND ');

    const columns = model ? entityFields((await database.entity.findUnique({
      where: { id: model.entityid }, select: { sampledata: true },
    }))?.sampledata).filter(field => field.list && field.name) : [];
    const [rows, [{ total }]] = await Promise.all([
      database.$queryRaw<(VehicleRow & { content: string | null })[]>(Prisma.sql`
        SELECT ${vehicleColumns}, v.content FROM entities_data v WHERE ${condition}
        ORDER BY ${orderBy[sort]} LIMIT ${listPageSize} OFFSET ${offset}
      `),
      database.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT COUNT(*) AS total FROM entities_data v WHERE ${condition}`),
    ]);
    const title = [country?.title, city?.title, depot?.title, model?.title].filter(Boolean).join(' → ');
    return {
      title, model: model ? { id: model.id, title: model.title, entityId: model.entityid } : null,
      country, city, depot, purpose, sort, offset, total: Number(total),
      columns: columns.map(field => field.name), vehicles: await vehicleSummaries(rows, columns),
    };
  }
}
