import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';

type Field = { name: string; id: string; type: string; important: string; scope: 'model' | 'vehicle'; list: string };

/** Title, colour and the `variable*_N` field rows of the entity form. */
function entityInput(body: Record<string, unknown>) {
  const { title, color } = body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.length > 255 ||
      typeof color !== 'string' || !/^#[a-f0-9]{6}$/i.test(color)) throw new BadRequestException();
  const sample: Record<string, Field> = {};
  const ids = new Set<string>();
  const indexes = Object.keys(body).map(key => key.match(/^variablename_([1-9]\d?)$/)?.[1]).filter(Boolean) as string[];
  for (const index of indexes.sort((a, b) => Number(a) - Number(b))) {
    const name = body['variablename_' + index];
    const id = body['variableid_' + index];
    const type = body['variabletype_' + index];
    const important = body['variableimportant_' + index];
    const scope = body['variablescope_' + index] ?? 'vehicle';
    const list = body['variablelist_' + index] ?? '0';
    if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
        typeof id !== 'string' || !id.trim() || id.length > 64 || ids.has(id.trim()) ||
        typeof type !== 'string' || !['1', '2', '3', '4'].includes(type) || (important !== '1' && important !== '2') ||
        (scope !== 'model' && scope !== 'vehicle') || (list !== '0' && list !== '1')) throw new BadRequestException();
    ids.add(id.trim());
    sample[index] = { name: name.trim(), id: id.trim(), type, important, scope, list: scope === 'vehicle' ? list : '0' };
  }
  const sampledata = JSON.stringify(sample);
  if (Buffer.byteLength(sampledata) > 65535) throw new BadRequestException();
  return { title: title.trim(), color, sample, sampledata };
}

function parseFields(raw: string): Field[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return [];
    return Object.values(value as Record<string, Partial<Field> | null>).map(field => ({
      name: String(field?.name ?? ''), id: String(field?.id ?? ''),
      type: String(field?.type ?? '1'), important: String(field?.important ?? '2'),
      scope: field?.scope === 'model' ? 'model' as const : 'vehicle' as const, list: field?.list === '1' ? '1' : '0',
    }));
  } catch {
    return [];
  }
}

@Controller('api/admin/entities')
export class AdminEntitiesController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'editor');
    const [entities, models, vehicles] = await Promise.all([
      database.entity.findMany({ select: { id: true, title: true, color: true, sampledata: true, createdate: true }, orderBy: { id: 'desc' } }),
      database.entityModel.groupBy({ by: ['entityid'], _count: { _all: true } }),
      database.entityData.groupBy({ by: ['entityid'], _count: { _all: true } }),
    ]);
    return entities.map(({ sampledata, createdate, ...entity }) => ({
      ...entity, createdAt: Number(createdate), fields: parseFields(sampledata).length,
      models: models.find(row => row.entityid === entity.id)?._count._all ?? 0,
      vehicles: vehicles.find(row => row.entityid === entity.id)?._count._all ?? 0,
    }));
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async detail(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId);
    const entity = await database.entity.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException();
    const [models, vehicles] = await Promise.all([
      database.entityModel.count({ where: { entityid: id } }),
      database.entityData.count({ where: { entityid: id } }),
    ]);
    return { id, title: entity.title, color: entity.color, fields: parseFields(entity.sampledata), models, vehicles };
  }

  @Post()
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const { title, color, sampledata } = entityInput(body);
    return database.entity.create({
      data: { title, color, sampledata, createdate: BigInt(Math.floor(Date.now() / 1000)) },
      select: { id: true },
    });
  }

  /**
   * Models and vehicles store their values by field position, so once an entity has any, its fields may be renamed,
   * retyped, moved between model and vehicle or appended, but none removed or reordered.
   */
  @Patch(':id')
  async update(@Req() request: Request, @Param('id') rawId: string, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId);
    const { title, color, sample, sampledata } = entityInput(body);
    await database.$transaction(async tx => {
      const [entity] = await tx.$queryRaw<{ sampledata: string }[]>(Prisma.sql`
        SELECT sampledata FROM entities WHERE id = ${id} FOR UPDATE
      `);
      if (!entity) throw new NotFoundException();
      const used = await tx.entityData.count({ where: { entityid: id } }) + await tx.entityModel.count({ where: { entityid: id } });
      if (used && Object.keys(sample).length < parseFields(entity.sampledata).length) {
        throw new ConflictException('У сущности есть модели или ТС: поля можно переименовать или добавить, но не удалить.');
      }
      await tx.entity.update({ where: { id }, data: { title, color, sampledata } });
    });
    return { id };
  }

  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'editor');
    const id = requireId(rawId);
    await database.$transaction(async tx => {
      const [entity] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM entities WHERE id = ${id} FOR UPDATE`);
      if (!entity) throw new NotFoundException();
      if (await tx.entityData.findFirst({ where: { entityid: id }, select: { id: true } }) ||
          await tx.entityModel.findFirst({ where: { entityid: id }, select: { id: true } })) {
        throw new ConflictException('К сущности привязаны модели или ТС.');
      }
      await tx.entityRequest.deleteMany({ where: { entityid: id, status: 0 } });
      await tx.entity.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { id };
  }
}
