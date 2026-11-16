import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { replicaStatuses, type JobKind } from '@nativegallery/contracts';
import { flag } from '@nativegallery/config';
import { database, type Prisma } from '@nativegallery/database';
import { consume, enabled, queueMissingPublications } from '@nativegallery/jobs';
import { createDriver, localFile, parseStorageConfig, photoMediaFiles, type StorageDriver } from '@nativegallery/storage';

const kinds = ['PublishMedia', 'VerifyMedia'] as const satisfies readonly JobKind[];
const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 2000);

function integer(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * Publishes photo and video files to the external storages and checks that what was published is still there.
 * Runs its own poll loop next to the ffmpeg jobs, so a slow upload never holds up video processing.
 */
@Injectable()
export class StorageWorker implements OnModuleInit, OnApplicationShutdown {
  private timer?: NodeJS.Timeout;
  private active?: Promise<void>;

  onModuleInit() {
    this.timer = setInterval(() => {
      if (this.active) return;
      this.active = this.poll().catch(console.error).finally(() => { this.active = undefined; });
    }, 1000);
  }

  async onApplicationShutdown() {
    clearInterval(this.timer);
    await this.active;
  }

  private async poll() {
    const ready: JobKind[] = [];
    for (const kind of kinds) if (await enabled(kind)) ready.push(kind);
    if (!ready.length) return;
    // Drain the queue while there is work, instead of one job a second.
    for (let index = 0; index < 50; index++) {
      const handled = await consume(ready, (kind, payload) => this.handle(kind, payload));
      if (!handled) break;
    }
  }

  private async handle(kind: JobKind, payload: Prisma.JsonValue) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid storage job');
    const targetId = integer(payload.targetId);
    if (!targetId) throw new Error('Invalid storage job');
    const target = await database.storageTarget.findUnique({ where: { id: targetId } });
    // A deleted or switched-off storage drops its queue; publishing resumes with «Опубликовать недостающие».
    if (!target || !target.enabled) return;
    const driver = createDriver(target.kind, parseStorageConfig(target.config));
    if (kind === 'PublishMedia') {
      const photoId = integer(payload.photoId);
      if (!photoId) throw new Error('Invalid storage job');
      await this.publish(target, driver, photoId, payload.force === true);
    } else {
      await this.verify(target, driver, { deep: payload.deep === true, photoId: integer(payload.photoId), scheduled: payload.scheduled === true });
    }
  }

  private async root() {
    return realpath(process.env.MEDIA_ROOT ?? '../../uploads');
  }

  private inside(root: string, file: string) {
    const path = resolve(root, file);
    const part = relative(root, path);
    if (!part || part.startsWith('..' + sep) || part === '..' || isAbsolute(part)) throw new Error('Path must be inside MEDIA_ROOT');
    return path;
  }

  /** Uploads every file of a photo that the storage does not have yet (or all of them with `force`). */
  private async publish(target: { id: number; mode: string }, driver: StorageDriver, photoId: number, force: boolean) {
    const photo = await database.photo.findUnique({ where: { id: photoId }, select: { photourl: true, content: true, moderated: true } });
    if (!photo) {
      await database.mediaReplica.deleteMany({ where: { target_id: target.id, photo_id: photoId } });
      return;
    }
    if (target.mode === 'published' && photo.moderated !== 1) return;
    // The video is still being rendered; the job comes back once its files exist.
    if (photo.moderated === -1) throw new Error('Видео ещё обрабатывается');
    const root = await this.root();
    const failures: string[] = [];
    for (const file of photoMediaFiles(photo)) {
      const where = { target_id_file: { target_id: target.id, file } };
      const existing = await database.mediaReplica.findUnique({ where });
      const record = (data: Prisma.MediaReplicaUncheckedUpdateInput) => database.mediaReplica.upsert({
        where, update: data, create: { target_id: target.id, photo_id: photoId, file, ...data } as Prisma.MediaReplicaUncheckedCreateInput,
      });
      let path: string;
      try {
        path = this.inside(root, file);
        if (!(await stat(path)).isFile()) throw new Error();
      } catch {
        // Nothing to retry: the original is gone from MEDIA_ROOT.
        await record({ status: replicaStatuses.failed, error: 'Нет оригинала в uploads: ' + file });
        continue;
      }
      try {
        const local = await localFile(path);
        if (!force && existing?.status === replicaStatuses.published && existing.sha256 === local.sha256) continue;
        const { remoteId } = await driver.put(file, local, existing?.remote_id);
        await record({
          status: replicaStatuses.published, size: BigInt(local.size), sha256: local.sha256, remote_id: remoteId ?? existing?.remote_id ?? null,
          published_at: new Date(), checked_at: new Date(), error: null,
        });
      } catch (error) {
        failures.push(file + ': ' + message(error));
        await record({ status: replicaStatuses.failed, error: message(error) });
      }
    }
    // Failed uploads go back to the queue with a growing delay.
    if (failures.length) throw new Error(failures.join('\n'));
  }

  /**
   * Checks the published files of a storage: present, of the right size and, when the storage reports one, with the
   * right checksum; `deep` downloads each file and compares SHA-256. Problems are written to the replicas, and with
   * STORAGE_VERIFY_REPAIR the broken ones are queued for publication again.
   */
  private async verify(target: { id: number; mode: string; created_at: Date }, driver: StorageDriver,
    options: { deep: boolean; photoId: number | null; scheduled: boolean }) {
    const statuses = [replicaStatuses.published, replicaStatuses.missing, replicaStatuses.mismatch];
    let cursor = 0, checked = 0, problems = 0, errors = 0;
    let firstError: string | null = null;
    for (;;) {
      const batch = await database.mediaReplica.findMany({
        where: { target_id: target.id, id: { gt: cursor }, status: { in: statuses }, ...(options.photoId ? { photo_id: options.photoId } : {}) },
        orderBy: { id: 'asc' }, take: 100,
      });
      if (!batch.length) break;
      cursor = batch[batch.length - 1].id;
      // A few files at a time: enough to hide latency, gentle on rate limits.
      for (let start = 0; start < batch.length; start += 4) {
        await Promise.all(batch.slice(start, start + 4).map(async replica => {
          checked++;
          try {
            const status = await this.check(driver, replica, options.deep);
            if (status.status !== replicaStatuses.published) problems++;
            await database.mediaReplica.update({ where: { id: replica.id }, data: { ...status, checked_at: new Date() } });
          } catch (error) {
            errors++;
            firstError ??= message(error);
            await database.mediaReplica.update({ where: { id: replica.id }, data: { error: 'Проверка не удалась: ' + message(error), checked_at: new Date() } });
          }
        }));
      }
    }
    if (!options.photoId) {
      await database.storageTarget.update({ where: { id: target.id }, data: {
        last_check_at: new Date(), last_check_deep: options.deep, last_check_count: checked, last_check_problems: problems + errors,
        last_check_error: errors ? 'Не удалось проверить файлов: ' + errors + '. ' + firstError : null,
      } });
    }
    if (flag('STORAGE_VERIFY_REPAIR') && !options.photoId) {
      // Broken replicas, plus photos uploaded since the storage was added that never reached it (the storage was off,
      // or the job was dropped). Older photos are only sent with «Опубликовать недостающие».
      await queueMissingPublications(target.id, target.mode, { since: Math.floor(target.created_at.getTime() / 1000), force: true });
    }
  }

  private async check(driver: StorageDriver, replica: { file: string; size: bigint | null; sha256: string | null; remote_id: string | null }, deep: boolean) {
    const remote = await driver.stat(replica.file, replica.remote_id);
    if (!remote) return { status: replicaStatuses.missing, error: 'Файл не найден в хранилище' };
    const remoteId = remote.remoteId && remote.remoteId !== replica.remote_id ? { remote_id: remote.remoteId } : {};
    if (replica.size !== null && BigInt(remote.size) !== replica.size) {
      return { status: replicaStatuses.mismatch, error: 'Размер ' + remote.size + ' Б вместо ' + replica.size + ' Б', ...remoteId };
    }
    if (remote.sha256 && replica.sha256 && remote.sha256 !== replica.sha256) {
      return { status: replicaStatuses.mismatch, error: 'SHA-256 не совпадает с оригиналом', ...remoteId };
    }
    if (deep && replica.sha256) {
      const hash = await driver.hash(replica.file, remote.remoteId ?? replica.remote_id);
      if (hash === null) return { status: replicaStatuses.missing, error: 'Файл не найден в хранилище', ...remoteId };
      if (hash !== replica.sha256) return { status: replicaStatuses.mismatch, error: 'Содержимое не совпадает с оригиналом (SHA-256)', ...remoteId };
    }
    return { status: replicaStatuses.published, error: null, ...remoteId };
  }
}
