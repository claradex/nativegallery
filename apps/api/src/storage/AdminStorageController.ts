import { BadRequestException, Body, Controller, Delete, Get, Header, HttpCode, NotFoundException, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import {
  isStorageKind, isStoragePublishMode, needsGoogleSignIn, replicaStatusName, replicaStatuses, storageKindById,
  type GoogleDevicePoll, type GoogleDeviceStart, type ReplicaStatus, type StorageOverview, type StorageReplicaPage, type StorageTargetData, type StorageTestResult,
} from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';
import { eligiblePhotos, queueMissingPublications } from '@nativegallery/jobs';
import { setting } from '@nativegallery/config';
import {
  createDriver, googleAuthorizeUrl, googleDevicePoll, googleDeviceStart, googleExchangeCode, googleOwnFolder, missingStorageFields, parseStorageConfig, testStorage,
} from '@nativegallery/storage';
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
    // Filled in by «Войти через Google»: the form can only clear them (null), not set them.
    if (field.readOnly) value = stored[field.key] ?? '';
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
  // A Google Drive storage is saved before its account is connected, since the sign-in needs it to exist.
  if (needsGoogleSignIn(kind, config)) return config;
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

/** The public address of the site, as the owner's browser sees it (the frontend forwards the host). */
function siteOrigin(request: Request) {
  const configured = setting('SITE_ORIGIN').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const first = (name: string) => request.get(name)?.split(',')[0]?.trim();
  return (first('x-forwarded-proto') || request.protocol) + '://' + (first('x-forwarded-host') || request.get('host') || 'localhost');
}

const googleCallback = '/api/admin/storage/google/callback';
const googleCookie = 'ng_google_oauth';
const googleCookiePath = '/api/admin/storage/google';

/** Sign-ins with a code waiting for the owner on Google's page, by handle. They live minutes, so memory is enough. */
const deviceSignIns = new Map<string, { targetId: number; deviceCode: string; expires: number; interval: number; next: number }>();

/** The site's own Google client for sign-in with a code, if it is configured. */
function deviceClient() {
  const clientId = setting('GOOGLE_CLIENT_ID').trim(), clientSecret = setting('GOOGLE_CLIENT_SECRET').trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
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
    return { targets: data, mediaRoot: resolve(process.env.MEDIA_ROOT ?? '../../uploads'), googleRedirectUri: siteOrigin(request) + googleCallback, googleDevice: !!deviceClient() };
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

  /**
   * «Войти через Google»: sends the owner to Google's consent screen for this storage's OAuth client. The state ties
   * the answer to this browser (a short-lived cookie) and to the storage.
   */
  @Get(':id/google')
  @Header('Cache-Control', 'private, no-store')
  async googleSignIn(@Req() request: Request, @Res() response: Response, @Param('id') raw: string) {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    const config = parseStorageConfig(target.config);
    if (target.kind !== 'gdrive') throw new BadRequestException('Это не хранилище Google Drive.');
    if (!config.clientId || !config.clientSecret) throw new BadRequestException('Сначала сохраните Client ID и Client secret.');
    const state = randomBytes(24).toString('hex') + '.' + target.id;
    const origin = siteOrigin(request);
    response.cookie(googleCookie, state, {
      httpOnly: true, sameSite: 'lax', secure: origin.startsWith('https:'), maxAge: 15 * 60 * 1000, path: googleCookiePath,
    });
    response.redirect(302, googleAuthorizeUrl({ clientId: config.clientId, redirectUri: origin + googleCallback, state, fullAccess: !!config.folderId }));
  }

  /**
   * Google's redirect back: keeps the refresh token and the account's address, creates the site's own folder when no
   * folder was given, catches up with the photos uploaded meanwhile and returns to «Хранилища» with the outcome.
   */
  @Get('google/callback')
  @Header('Cache-Control', 'private, no-store')
  async googleCallback(@Req() request: Request, @Res() response: Response, @Query() query: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'owner');
    const back = (outcome: Record<string, string>) => {
      response.clearCookie(googleCookie, { path: googleCookiePath });
      response.redirect(302, '/admin?' + new URLSearchParams({ type: 'Storage', ...outcome }));
    };
    const state = typeof query.state === 'string' ? query.state : '';
    const expected = request.headers.cookie?.match(/(?:^|;\s*)ng_google_oauth=([a-f0-9]{48}\.\d{1,10})(?:;|$)/)?.[1] ?? '';
    if (!state || state.length !== expected.length || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) {
      return back({ google: 'error', message: 'Вход через Google устарел или открыт в другом браузере. Попробуйте ещё раз.' });
    }
    if (typeof query.error === 'string') {
      return back({ google: 'error', message: query.error === 'access_denied' ? 'Доступ к Google Drive не выдан.' : 'Google ответил ошибкой: ' + query.error.slice(0, 100) });
    }
    const target = await database.storageTarget.findUnique({ where: { id: Number(state.split('.')[1]) } });
    if (!target || target.kind !== 'gdrive') return back({ google: 'error', message: 'Хранилище уже удалено.' });
    const config = parseStorageConfig(target.config);
    try {
      if (typeof query.code !== 'string' || !query.code) throw new Error('Google не вернул код входа.');
      if (!config.clientId || !config.clientSecret) throw new Error('У хранилища нет Client ID и Client secret.');
      const granted = await googleExchangeCode({
        clientId: config.clientId, clientSecret: config.clientSecret, code: query.code, redirectUri: siteOrigin(request) + googleCallback,
      });
      await this.connectGoogle(target, { ...config, ...granted, folderId: config.folderId || await googleOwnFolder(granted.accessToken, 'NativeGallery') });
    } catch (error) {
      return back({ google: 'error', message: error instanceof Error ? error.message.slice(0, 300) : 'Не удалось войти через Google.' });
    }
    back({ google: 'connected', title: target.title });
  }

  /** Keeps what the sign-in gave and catches up with the photos uploaded while the storage had no account. */
  private async connectGoogle(target: Target, connected: Record<string, string> & { refreshToken: string; email: string; accessToken: string; folderId: string }) {
    const { accessToken: _, email, ...config } = connected;
    await database.storageTarget.update({ where: { id: target.id }, data: { config: JSON.stringify({ ...config, account: email }) } });
    if (target.enabled) await queueMissingPublications(target.id, target.mode, { since: Math.floor(target.created_at.getTime() / 1000) });
  }

  /**
   * «Подключить Google Drive» with the site's own client: asks Google for a code the owner types on google.com/device.
   * Such sign-ins may only reach the site's own files, so the storage always gets the site's own folder.
   */
  @Post(':id/google/device')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async googleDevice(@Req() request: Request, @Param('id') raw: string): Promise<GoogleDeviceStart> {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    if (target.kind !== 'gdrive') throw new BadRequestException('Это не хранилище Google Drive.');
    const client = deviceClient();
    if (!client) throw new BadRequestException('Вход по коду не настроен: задайте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в конфигурации.');
    let started: Awaited<ReturnType<typeof googleDeviceStart>>;
    try { started = await googleDeviceStart(client.clientId); } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Google не выдал код.');
    }
    const now = Date.now();
    for (const [key, item] of deviceSignIns) if (item.expires < now || item.targetId === target.id) deviceSignIns.delete(key);
    const handle = randomBytes(18).toString('hex');
    deviceSignIns.set(handle, {
      targetId: target.id, deviceCode: started.deviceCode, expires: now + started.expiresIn * 1000, interval: started.interval, next: now + started.interval * 1000,
    });
    return { handle, userCode: started.userCode, verificationUrl: started.verificationUrl, expiresIn: started.expiresIn, interval: started.interval };
  }

  /** Whether the owner has entered the code yet; once they have, the storage is connected. */
  @Post(':id/google/device/poll')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async googleDevicePoll(@Req() request: Request, @Param('id') raw: string, @Body('handle') handle: unknown): Promise<GoogleDevicePoll> {
    await this.auth.requireAdmin(request, 'owner');
    const target = await this.target(raw);
    const session = typeof handle === 'string' ? deviceSignIns.get(handle) : undefined;
    if (!session || session.targetId !== target.id || session.expires < Date.now()) {
      if (typeof handle === 'string') deviceSignIns.delete(handle);
      return { status: 'expired', message: 'Код устарел. Получите новый.' };
    }
    if (Date.now() < session.next) return { status: 'pending' };
    const client = deviceClient();
    if (!client) return { status: 'error', message: 'Вход по коду больше не настроен.' };
    try {
      const result = await googleDevicePoll({ ...client, deviceCode: session.deviceCode });
      if (result.status === 'slow_down') session.interval += 5;
      session.next = Date.now() + session.interval * 1000;
      if (result.status === 'pending' || result.status === 'slow_down') return { status: 'pending' };
      deviceSignIns.delete(handle as string);
      if (result.status === 'denied') return { status: 'denied', message: 'Доступ к Google Drive не выдан.' };
      if (result.status !== 'granted') return { status: 'expired', message: 'Код устарел. Получите новый.' };
      const config = parseStorageConfig(target.config);
      delete config.serviceAccount;
      await this.connectGoogle(target, {
        ...config, ...client, refreshToken: result.refreshToken, email: result.email, accessToken: result.accessToken,
        folderId: await googleOwnFolder(result.accessToken, 'NativeGallery'),
      });
      return { status: 'connected', account: result.email };
    } catch (error) {
      deviceSignIns.delete(handle as string);
      return { status: 'error', message: error instanceof Error ? error.message.slice(0, 300) : 'Не удалось подключить Google.' };
    }
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
