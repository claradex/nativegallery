import { All, BadRequestException, Body, ConflictException, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { GeoKind, geoKinds, geoParentKinds, type GeoNode } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';

/** Validated GeoDB fields; `legacy` bodies (`body` = title only) make a free place at the top level. */
async function geoInput(body: Record<string, unknown>, id: number | null) {
  const title = body?.title ?? body?.body;
  if (typeof title !== 'string' || !title.trim() || Buffer.byteLength(title) > 65535) throw new BadRequestException();
  const kind = body.kind === undefined ? GeoKind.Place : Number(body.kind);
  if (!geoKinds.some(item => item.id === kind)) throw new BadRequestException();
  const rawParent = body.parent_id;
  const parent_id = rawParent === undefined || rawParent === null || rawParent === '' || rawParent === '0'
    ? null : requireId(rawParent, BadRequestException);
  if (parent_id) {
    if (parent_id === id) throw new BadRequestException('Запись не может входить сама в себя.');
    const parent = await database.geoEntry.findUnique({ where: { id: parent_id }, select: { kind: true } });
    if (!parent || !geoParentKinds(kind).includes(parent.kind)) {
      throw new BadRequestException('«' + geoKinds.find(item => item.id === kind)?.label + '» не может входить в выбранную запись.');
    }
  } else if (kind === GeoKind.Depot) {
    throw new BadRequestException('Депо должно относиться к городу.');
  }
  const code = typeof body.code === 'string' && body.code.trim() ? body.code.trim().toLowerCase() : null;
  if (code && !/^[a-z0-9-]{1,8}$/.test(code)) throw new BadRequestException('Код — до 8 латинских букв или цифр.');
  const sort = body.sort === undefined || body.sort === '' ? 0 : Number(body.sort);
  if (!Number.isInteger(sort) || Math.abs(sort) > 1000000) throw new BadRequestException();
  return { title: title.trim(), kind, parent_id, code, sort };
}

@Controller('api/admin/geodb')
export class AdminGeoController {
  constructor(private readonly auth: AuthService) {}

  /** The whole tree, with the number of vehicles that refer to each entry. */
  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request): Promise<(GeoNode & { vehicles: number })[]> {
    await this.auth.requireAdmin(request, 'editor');
    const [entries, usage] = await Promise.all([
      database.geoEntry.findMany({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] }),
      database.$queryRaw<{ id: number; vehicles: bigint }[]>(Prisma.sql`
        SELECT id, SUM(n) AS vehicles FROM (
          SELECT city_id AS id, COUNT(*) AS n FROM entities_data WHERE city_id IS NOT NULL GROUP BY city_id
          UNION ALL SELECT depot_id, COUNT(*) FROM entities_data WHERE depot_id IS NOT NULL GROUP BY depot_id
        ) used GROUP BY id
      `),
    ]);
    const counts = new Map(usage.map(row => [row.id, Number(row.vehicles)]));
    return entries.map(entry => ({ ...entry, vehicles: counts.get(entry.id) ?? 0 }));
  }

  @Post()
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    return database.geoEntry.create({ data: await geoInput(body, null), select: { id: true } });
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') rawId: string, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId, BadRequestException);
    const entry = await database.geoEntry.findUnique({ where: { id }, select: { kind: true } });
    if (!entry) throw new NotFoundException();
    const data = await geoInput(body, id);
    if (data.kind !== entry.kind) {
      const [children, vehicles] = await Promise.all([
        database.geoEntry.findMany({ where: { parent_id: id }, select: { kind: true } }),
        database.entityData.count({ where: { OR: [{ city_id: id }, { depot_id: id }] } }),
      ]);
      if (vehicles || children.some(child => !geoParentKinds(child.kind).includes(data.kind))) {
        throw new ConflictException('Тип нельзя сменить: к записи привязаны ТС или вложенные записи другого типа.');
      }
    }
    // A parent may not be moved under its own descendant.
    for (let current = data.parent_id, step = 0; current && step < 8; step++) {
      if (current === id) throw new BadRequestException('Запись не может входить сама в себя.');
      current = (await database.geoEntry.findUnique({ where: { id: current }, select: { parent_id: true } }))?.parent_id ?? null;
    }
    await database.geoEntry.update({ where: { id }, data });
    return { id };
  }

  @Delete(':id')
  async destroy(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    await this.removeEntry(requireId(rawId, BadRequestException));
    return { id: Number(rawId) };
  }

  private async removeEntry(id: number) {
    await database.$transaction(async tx => {
      const [entry] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM geodb WHERE id = ${id} FOR UPDATE`);
      if (!entry) throw new NotFoundException();
      if (await tx.geoEntry.findFirst({ where: { parent_id: id }, select: { id: true } })) throw new ConflictException('В записи есть вложенные записи.');
      if (await tx.entityData.findFirst({ where: { OR: [{ city_id: id }, { depot_id: id }] }, select: { id: true } })) {
        throw new ConflictException('К записи привязаны ТС.');
      }
      await tx.geoEntry.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  // Legacy endpoints of the old admin panel.

  @All('load')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async load(@Req() request: Request) {
    return (await this.list(request)).map(({ id, title }) => {
      const label = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<tr id="geodb' + id + '"><th>' + id + '</th><td>' + label +
        '</td><td><div class="cmt-submit"><button type="button" class="btn btn-sm btn-danger" data-geo-delete="' +
        id + '" style="margin-left:15px">Удалить</button></div></td></tr>';
    }).join('');
  }

  @All('create')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async legacyCreate(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.create(request, body);
    return '{"errorcode":0,"error":0}';
  }

  @All('delete')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async remove(@Req() request: Request, @Query('id') raw: unknown) {
    await this.auth.requireAdmin(request, 'editor');
    await this.removeEntry(requireId(raw, BadRequestException));
    return '{"errorcode":0,"error":0}';
  }
}
