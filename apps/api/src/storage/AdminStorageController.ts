import { BadRequestException, Body, Controller, Delete, Get, Header, HttpCode, NotFoundException, Param, Post, Put, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { resolve } from 'node:path';
import {
  isStorageKind, isStoragePublishMode, replicaStatusName, replicaStatuses, storageKindById,
  type ReplicaStatus, type StorageOverview, type StorageReplicaPage, type StorageTargetData, type StorageTestResult,
} from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';
import { eligiblePhotos, queueMissingPublications } from '@nativegallery/jobs';
import { createDriver, missingStorageFields, parseStorageConfig, testStorage } from '@nativegallery/storage';
import { AuthService } from '../auth/AuthService';

type Target = Awaited<ReturnType<typeof database.storageTarget.findMany>>[number];

function id(value: string) {
  if (!/^\d{1,10}$/.test(value) || Number(value) > 2147483647) throw new NotFoundException();
  return Number(value);
}

/** Form posts send nested values as a JSON string; a JSON body sends the object itself. */
function object(value: unknown): Record<string, unknown> {
  let raw = value;
  if (typeof value === 'string') {
    try { raw = JSON.parse(value); } catch { throw new BadRequestException(); }
  }
  if (raw === undefined) return {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new BadRequestException();
  return raw as Record<string, unknown>;
}

/**
 * Settings of a storage from the form: only the kind's fields, trimmed and checked. A secret sent empty keeps the
 * stored value; `null` clears it.
 */
function storageConfig(kind: string, input: Record<string, unknown>, stored: Record<string, string> = {}) {
  const definition = storageKindById.get(kind);
  if (!definition) throw new BadRequestException('Неизвестный тип хранилища.');
  const config: Record<string, string> = {};
  for (const field of definition.fields) {
    const raw = input[field.key];
    if (raw === null) continue;
    if (raw !== undefined && typeof raw !== 'string' && typeof raw !== 'boolean') throw new BadRequestException();
    let value = typeof raw === 'boolean' ? String(raw) : (raw ?? '').trim();
    if (value.length > 20000) throw new BadRequestException('Слишком длинное значение: ' + field.label + '.');
    if (field.type === 'secret' && value === '') value = stored[field.key] ?? '';
    if (field.type === 'boolean' && value !== '' && value !== 'true' && value !== 'false') throw new BadRequestException();
    if (field.type === 'url' && value) {
      let url: URL;
      try { url = new URL(value); } catch { throw new BadRequestException('Некорректный адрес: ' + field.label + '.'); }
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new BadRequestException('Адрес должен начинаться с http:// или https://.');
    }
    if (value) config[field.key] = value;
  }
  const missing = missingStorageFields(kind, config);
  if (missing.length) throw new BadRequestException('Не заполнено: ' + missing.join(', ') + '.');
  try { createDriver(kind, config); } catch (error) {
    throw new BadRequestException(error instanceof Error ? error.message : 'Некорректные настройки.');
  }
  return config;
}

function secretsOf(kind: string, config: Record<string, string>) {
  const secret = new Set((storageKindById.get(kind)?.fields ?? []).filter(field => field.type === 'secret').map(field => field.key));
  return {
    config: Object.fromEntries(Object.entries(config).map(([key, value]) => [key, secret.has(key) ? '' : value])),
    secrets: Object.keys(config).filter(key => secret.has(key) && config[key]),
  };
}

const problemStatuses = [replicaStatuses.failed, replicaStatuses.missing, replicaStatuses.mismatch];

/**
 * «Хранилища» in the admin panel: external storages that photos and videos are published to, their checks and the
 * files that did not make it. Owner only, since the settings hold access keys.
 */
@Controller('api/admin/storage')
export class AdminStorageController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async overview(@Req() request: Request): Promise<StorageOverview> {
    await this.auth.requireAdmin(request, 'owner');
    const targets = await database.storageTarget.findMany({ orderBy: { id: 'asc' } });
    const [files, queued] = await Promise.all([
      database.mediaReplica.groupBy({ by: ['target_id', 'status'], _count: { _all: true } }),
      database.$queryRaw<{ target: unknown; count: bigint }[]>(Prisma.sql`
        SELECT JSON_EXTRACT(payload, '$.targetId') AS target, COUNT(*) AS count FROM ng_jobs
        WHERE kind IN ('PublishMedia', 'VerifyMedia') AND completed_at IS NULL GROUP BY target`),
    ]);
    const data = await Promise.all(targets.map(async target => {
      const counts = Object.fromEntries(Object.keys(replicaStatuses).map(name => [name, 0])) as Record<ReplicaStatus, number>;
      for (const row of files) if (row.target_id === target.id) counts[replicaStatusName(row.status)] += row._count._all;
      return this.describe(target, counts, Number(queued.find(row => Number(row.target) === target.id)?.count ?? 0), await this.photoTotals(target));
    }));
    return { targets: data, mediaRoot: resolve(process.env.MEDIA_ROOT ?? '../../uploads') };
  }

  private async photoTotals(target: Target) {
    const [row] = await database.$queryRaw<{ eligible: bigint; published: bigint | null }[]>(Prisma.sql`
      SELECT COUNT(*) AS eligible,
        SUM(EXISTS (SELECT 1 FROM ng_media_replicas r WHERE r.target_id = ${target.id} AND r.photo_id = p.id)
          AND NOT EXISTS (SELECT 1 FROM ng_media_replicas r WHERE r.target_id = ${target.id} AND r.photo_id = p.id AND r.status <> 1)) AS published
      FROM photos p WHERE ${eligiblePhotos(target.mode)}`);
    return { eligible: Number(row?.eligible ?? 0), published: Number(row?.published ?? 0) };
  }

  private describe(target: Target, files: Record<ReplicaStatus, number>, queued: number, photos: { eligible: number; published: number }): StorageTargetData {
    const { config, secrets } = secretsOf(target.kind, parseStorageConfig(target.config));
    return {
      id: target.id, title: target.title, kind: isStorageKind(target.kind) ? target.kind : 'disk', enabled: target.enabled,
      mode: isStoragePublishMode(target.mode) ? target.mode : 'all', config, secrets, createdAt: target.created_at.toISOString(),
      lastCheck: target.last_check_at ? {
        at: target.last_check_at.toISOString(), deep: target.last_check_deep, checked: target.last_check_count,
        problems: target.last_check_problems, error: target.last_check_error,
      } : null,
      files, photos, queued,
    };
  }

  private async target(raw: string) {
    const target = await database.storageTarget.findUnique({ where: { id: id(raw) } });
    if (!target) throw new NotFoundException();
    return target;
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'owner');
    const { title, kind, mode, enabled } = body ?? {};
    if (typeof title !== 'string' || !title.trim() || title.length > 255) throw new BadRequestException('Укажите название (до 255 символов).');
    if (!isStorageKind(kind)) throw new BadRequestException('Неизвестный тип хранилища.');
    if (!isStoragePublishMode(mode)) throw new BadRequestException();
    const config = storageConfig(kind, object(body.config));
    const target = await database.storageTarget.create({ data: {
      title: title.trim(), kind, mode, enabled: enabled !== 'false' && enabled !== false, config: JSON.stringify(config),
    } });
    return { id: target.id };
  }

  /** Changes the name, mode, switch and settings; the kind stays as created, since the published files belong to it. */
  @Put(':id')
  @Header('Cache-Control', 'private, no-store')
  async update(@Req() request: Request, @Param('id') raw: string, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    const { title, mode, enabled } = body ?? {};
    if (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 255)) throw new BadRequestException('Укажите название (до 255 символов).');
    if (mode !== undefined && !isStoragePublishMode(mode)) throw new BadRequestException();
    if (enabled !== undefined && !['true', 'false', true, false].includes(enabled as string | boolean)) throw new BadRequestException();
    const config = body.config === undefined ? undefined : storageConfig(target.kind, object(body.config), parseStorageConfig(target.config));
    const on = enabled === undefined ? undefined : enabled === true || enabled === 'true';
    await database.storageTarget.update({ where: { id: target.id }, data: {
      title: typeof title === 'string' ? title.trim() : undefined, mode: mode as string | undefined, enabled: on,
      config: config ? JSON.stringify(config) : undefined,
    } });
    // Switched on again (or to «all uploads»): catch up with what was uploaded meanwhile, from its creation on.
    if ((on && !target.enabled) || (mode === 'all' && target.mode !== 'all')) {
      await queueMissingPublications(target.id, (mode as string | undefined) ?? target.mode, { since: Math.floor(target.created_at.getTime() / 1000) });
    }
    return { id: target.id };
  }

  /** Forgets a storage and its replica records; the files already published stay where they are. */
  @Delete(':id')
  @Header('Cache-Control', 'private, no-store')
  async remove(@Req() request: Request, @Param('id') raw: string) {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    await database.$transaction([
      database.mediaReplica.deleteMany({ where: { target_id: target.id } }),
      database.$executeRaw(Prisma.sql`DELETE FROM ng_jobs WHERE kind IN ('PublishMedia', 'VerifyMedia') AND completed_at IS NULL
        AND JSON_EXTRACT(payload, '$.targetId') = ${target.id}`),
      database.storageTarget.delete({ where: { id: target.id } }),
    ]);
    return { deleted: target.id };
  }

  /**
   * Tries a storage end to end (write, read back, checksum, delete). Takes the form's settings, so they can be checked
   * before saving; with `id` the stored secrets fill in the ones left empty.
   */
  @Post('test')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async test(@Req() request: Request, @Body() body: Record<string, unknown>): Promise<StorageTestResult> {
    await this.auth.requireAdmin(request, 'owner');
    const stored = typeof body?.id === 'string' && body.id ? await this.target(body.id) : null;
    const kind = stored?.kind ?? body?.kind;
    if (!isStorageKind(kind)) throw new BadRequestException('Неизвестный тип хранилища.');
    let config: Record<string, string>;
    try {
      config = body.config === undefined && stored ? parseStorageConfig(stored.config)
        : storageConfig(kind, object(body.config), stored ? parseStorageConfig(stored.config) : {});
    } catch (error) {
      if (error instanceof BadRequestException) return { ok: false, message: String((error.getResponse() as { message?: unknown }).message ?? error.message), milliseconds: 0 };
      throw error;
    }
    return testStorage(kind, config);
  }

  /** Queues a check of the published files; `deep` downloads them and compares SHA-256. */
  @Post(':id/verify')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async verify(@Req() request: Request, @Param('id') raw: string, @Body('deep') deep: unknown, @Body('photo') photo: unknown) {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    const photoId = typeof photo === 'string' && /^\d{1,10}$/.test(photo) ? Number(photo) : undefined;
    await database.job.create({ data: {
      kind: 'VerifyMedia', dedupe_key: 'verify-media:' + target.id + ':manual:' + Date.now().toString(36) + (photoId ? ':' + photoId : ''),
      payload: { targetId: target.id, deep: deep === 'true' || deep === true, ...(photoId ? { photoId } : {}) }, available_at: new Date(),
    } });
    return { queued: 1 };
  }

  /**
   * Queues publication of the photos the storage is missing: never sent, failed, missing or mismatched on check.
   * With `photo` it re-uploads that one photo's files whatever their state.
   */
  @Post(':id/publish')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async publish(@Req() request: Request, @Param('id') raw: string, @Body('photo') photo: unknown) {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    if (!target.enabled) throw new BadRequestException('Хранилище выключено.');
    if (photo !== undefined && photo !== '') {
      const photoId = typeof photo === 'string' && /^\d{1,10}$/.test(photo) ? Number(photo) : 0;
      if (!photoId || !await database.photo.findUnique({ where: { id: photoId }, select: { id: true } })) throw new NotFoundException();
      await database.job.create({ data: {
        kind: 'PublishMedia', dedupe_key: 'publish-media:' + target.id + ':' + photoId + ':' + Date.now().toString(36),
        payload: { targetId: target.id, photoId, force: true }, available_at: new Date(),
      } });
      return { queued: 1 };
    }
    return { queued: await queueMissingPublications(target.id, target.mode) };
  }

  /** Files of a storage by state: `problems` (failed, missing, mismatched), a single status, or everything. */
  @Get(':id/replicas')
  @Header('Cache-Control', 'private, no-store')
  async replicas(@Req() request: Request, @Param('id') raw: string, @Query('status') status: unknown, @Query('page') rawPage: unknown,
    @Query('photo') photo: unknown): Promise<StorageReplicaPage> {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    const page = typeof rawPage === 'string' && /^\d{1,5}$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1;
    const photoId = typeof photo === 'string' && /^\d{1,10}$/.test(photo) && Number(photo) <= 2147483647 ? Number(photo) : undefined;
    const statusFilter = status === 'all' ? undefined
      : typeof status === 'string' && status in replicaStatuses ? replicaStatuses[status as ReplicaStatus]
      : { in: problemStatuses };
    const where: Prisma.MediaReplicaWhereInput = { target_id: target.id, status: statusFilter, photo_id: photoId };
    const size = 50;
    const [total, rows] = await Promise.all([
      database.mediaReplica.count({ where }),
      database.mediaReplica.findMany({ where, orderBy: [{ photo_id: 'desc' }, { id: 'asc' }], skip: (page - 1) * size, take: size }),
    ]);
    return {
      total, page, pages: Math.max(1, Math.ceil(total / size)),
      replicas: rows.map(row => ({
        id: row.id, photoId: row.photo_id, file: row.file, status: replicaStatusName(row.status), size: row.size === null ? null : Number(row.size),
        publishedAt: row.published_at?.toISOString() ?? null, checkedAt: row.checked_at?.toISOString() ?? null, error: row.error,
      })),
    };
  }
}
