import { All, Controller, ForbiddenException, Get, Header, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

const success = '{"errorcode":0,"error":0}';

@Controller('api/admin/models')
export class VehicleModerationController {
  constructor(private readonly auth: AuthService) {}

  @Get('requests')
  @Header('Cache-Control', 'private, no-store')
  async pending(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
    const rows = await database.entityRequest.findMany({ where: { status: 0 }, orderBy: { id: 'desc' } });
    const models = await database.entity.findMany({ where: { id: { in: [...new Set(rows.map(row => row.entityid))] } } });
    const byId = new Map(models.map(model => [model.id, model]));
    return rows.map(row => {
      const model = byId.get(row.entityid);
      const schema = parseRecord(model?.sampledata);
      const values = parseRecord(row.data);
      return { id: row.id, title: row.title, model: model?.title ?? '',
        fields: Object.values(schema).map((field, index) => ({
          label: typeof field?.name === 'string' ? field.name : '',
          value: String(values[index + 1]?.value ?? ''),
        })),
      };
    });
  }

  @Get('catalog')
  @Header('Cache-Control', 'private, no-store')
  async catalog(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
    return database.$queryRaw<{ id: number; title: string; model: string }[]>(Prisma.raw('SELECT v.id, v.title, COALESCE(e.title, \'\') AS model FROM entities_data v LEFT JOIN entities e ON e.id = v.entityid ORDER BY v.id DESC'));
  }

  @All('requests/:id/:action')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'private, no-store')
  async decide(@Req() request: Request, @Param('id') value: string, @Param('action') action: string) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();

    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647 ||
        (action !== 'accept' && action !== 'decline')) return success;

    await database.$transaction(async tx => {
      const [pending] = await tx.$queryRaw<{ title: string; entityid: number; data: string }[]>(Prisma.sql`
        SELECT title, entityid, data FROM entities_requests WHERE id = ${id} AND status = 0 FOR UPDATE
      `);
      if (!pending) return;
      if (action === 'accept') {
        await tx.entityData.create({
          data: {
            title: pending.title, entityid: pending.entityid, content: pending.data,
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
