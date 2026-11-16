import { All, Controller, Get, Header, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { GeoKind } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';

const success = '{"errorcode":0,"error":0}';

@Controller('api/admin/models')
export class VehicleModerationController {
  constructor(private readonly auth: AuthService) {}

  /** Vehicle requests sent by users: pending ones by default, `status=1`/`2` for accepted or declined history. */
  @Get('requests')
  @Header('Cache-Control', 'private, no-store')
  async pending(@Req() request: Request, @Query('status') rawStatus: unknown) {
    await this.auth.requireAdmin(request, 'editor');
    const status = rawStatus === '1' || rawStatus === '2' ? Number(rawStatus) : 0;
    const rows = await database.entityRequest.findMany({ where: { status }, orderBy: { id: 'desc' }, take: status ? 100 : undefined });
    const [models, users, vehicleModels, places] = await Promise.all([
      database.entity.findMany({ where: { id: { in: [...new Set(rows.map(row => row.entityid))] } } }),
      database.user.findMany({ where: { id: { in: [...new Set(rows.map(row => row.user_id))] } }, select: { id: true, username: true } }),
      database.entityModel.findMany({ where: { id: { in: rows.flatMap(row => row.model_id ? [row.model_id] : []) } }, select: { id: true, title: true } }),
      database.geoEntry.findMany({ where: { id: { in: rows.flatMap(row => row.city_id ? [row.city_id] : []) } }, select: { id: true, title: true } }),
    ]);
    const byId = new Map(models.map(model => [model.id, model]));
    const names = new Map(users.map(user => [user.id, user.username]));
    return rows.map(row => {
      const model = byId.get(row.entityid);
      const schema = parseRecord(model?.sampledata);
      const values = parseRecord(row.data);
      return { id: row.id, title: row.title, model: model?.title ?? '', color: model?.color ?? '', status: row.status,
        vehicleModel: vehicleModels.find(item => item.id === row.model_id)?.title ?? '',
        city: places.find(item => item.id === row.city_id)?.title ?? '',
        userId: row.user_id, username: names.get(row.user_id) ?? '', createdAt: Number(row.created_at),
        fields: Object.values(schema).map((field, index) => ({
          label: typeof field?.name === 'string' ? field.name : '',
          value: String(values[index + 1]?.value ?? ''),
        })),
      };
    });
  }

  /** Counters for the admin menu badges. */
  @Get('summary')
  @Header('Cache-Control', 'private, no-store')
  async summary(@Req() request: Request) {
    const viewer = await this.auth.requireAdmin(request, 'moderator');
    const [pendingPhotos, pendingRequests] = await Promise.all([
      database.photo.count({ where: { moderated: 0 } }),
      viewer.admin === 2 ? 0 : database.entityRequest.count({ where: { status: 0 } }),
    ]);
    return { pendingPhotos, pendingRequests };
  }

  @All('requests/:id/:action')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'private, no-store')
  async decide(@Req() request: Request, @Param('id') value: string, @Param('action') action: string) {
    await this.auth.requireAdmin(request, 'editor');

    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647 ||
        (action !== 'accept' && action !== 'decline')) return success;

    await database.$transaction(async tx => {
      const [pending] = await tx.$queryRaw<{ title: string; entityid: number; data: string; model_id: number | null; city_id: number | null }[]>(Prisma.sql`
        SELECT title, entityid, data, model_id, city_id FROM entities_requests WHERE id = ${id} AND status = 0 FOR UPDATE
      `);
      if (!pending) return;
      if (action === 'accept') {
        // The model or city may have been removed since the request was sent.
        const [model, city] = await Promise.all([
          pending.model_id ? tx.entityModel.findFirst({ where: { id: pending.model_id, entityid: pending.entityid }, select: { id: true } }) : null,
          pending.city_id ? tx.geoEntry.findFirst({ where: { id: pending.city_id, kind: GeoKind.City }, select: { id: true } }) : null,
        ]);
        await tx.entityData.create({
          data: {
            title: pending.title, entityid: pending.entityid, content: pending.data, model_id: model?.id ?? null, city_id: city?.id ?? null,
            createdate: BigInt(Math.floor(Date.now() / 1000)),
          },
        });
      }
      await tx.entityRequest.update({ where: { id }, data: { status: action === 'accept' ? 1 : 2 } });
    });
    return success;
  }
}

function parseRecord(raw?: string): Record<string, { name?: unknown; value?: unknown } | null> {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (value && typeof value === 'object') return value as Record<string, { name?: unknown; value?: unknown } | null>;
  } catch {}
  return {};
}
