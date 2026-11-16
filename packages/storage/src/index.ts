import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { storageKindById, type StorageKind, type StorageTestResult } from '@nativegallery/contracts';
import { DiskStorage } from './DiskStorage';
import { localFile, type StorageDriver } from './Driver';
import { GoogleDriveStorage } from './GoogleDriveStorage';
import { S3Storage } from './S3Storage';
import { WebDavStorage } from './WebDavStorage';

export { contentType, encodePath, hashFile, localFile, prefixed, safeKey, type LocalFile, type RemoteStat, type StorageDriver } from './Driver';
export { http, failure } from './Http';
export { signV4 } from './S3Storage';
export { DiskStorage, GoogleDriveStorage, S3Storage, WebDavStorage };

export function createDriver(kind: StorageKind | string, config: Record<string, string>): StorageDriver {
  switch (kind) {
    case 'disk': return new DiskStorage(config);
    case 's3': return new S3Storage(config);
    case 'webdav': return new WebDavStorage(config);
    case 'gdrive': return new GoogleDriveStorage(config);
  }
  throw new Error('Неизвестный тип хранилища: ' + kind);
}

/** The stored JSON settings of a storage, as strings; anything malformed reads as empty. */
export function parseStorageConfig(text: string | null | undefined): Record<string, string> {
  try {
    const value = JSON.parse(text || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string')) as Record<string, string>;
  } catch {
    return {};
  }
}

/** Missing required fields of a storage's settings, by label. */
export function missingStorageFields(kind: string, config: Record<string, string>) {
  return (storageKindById.get(kind)?.fields ?? []).filter(field => field.required && !config[field.key]?.trim()).map(field => field.label);
}

/**
 * Checks that a storage works end to end: writes a small probe file, reads its size back, downloads it to compare the
 * checksum and deletes it.
 */
export async function testStorage(kind: string, config: Record<string, string>): Promise<StorageTestResult> {
  const started = Date.now();
  const key = '.nativegallery-check/' + randomUUID() + '.txt';
  const path = join(tmpdir(), 'nativegallery-check-' + randomUUID() + '.txt');
  let stage = 'настройки';
  try {
    const missing = missingStorageFields(kind, config);
    if (missing.length) throw new Error('Не заполнено: ' + missing.join(', ') + '.');
    const driver = createDriver(kind, config);
    await writeFile(path, 'NativeGallery storage check ' + new Date().toISOString() + '\n');
    const file = await localFile(path);
    stage = 'запись';
    const { remoteId } = await driver.put(key, file);
    stage = 'чтение';
    const stat = await driver.stat(key, remoteId);
    if (!stat) throw new Error('записанный файл не найден');
    if (stat.size !== file.size) throw new Error('размер ' + stat.size + ' вместо ' + file.size);
    const hash = await driver.hash(key, remoteId ?? stat.remoteId);
    if (hash !== file.sha256) throw new Error('контрольная сумма не совпала');
    stage = 'удаление';
    await driver.remove(key, remoteId ?? stat.remoteId);
    return { ok: true, message: 'Запись, чтение, сверка SHA-256 и удаление прошли успешно.', milliseconds: Date.now() - started };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: 'Ошибка на этапе «' + stage + '»: ' + message, milliseconds: Date.now() - started };
  } finally {
    await rm(path, { force: true });
  }
}

/**
 * The files of a photo kept in MEDIA_ROOT, as paths relative to it: the image (or a video's poster) and the video.
 * URLs of the PHP version that point to other hosts are left out.
 */
export function photoMediaFiles(photo: { photourl: string; content: string }) {
  const files = new Set<string>();
  const add = (url: unknown) => {
    if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
    const path = url.slice('/uploads/'.length).split(/[?#]/)[0];
    try {
      const decoded = decodeURIComponent(path);
      if (decoded.split('/').every(part => part && part !== '.' && part !== '..' && !part.includes('\\'))) files.add(decoded);
    } catch {}
  };
  add(photo.photourl);
  try { add(JSON.parse(photo.content || '{}')?.videourl); } catch {}
  return [...files];
}
