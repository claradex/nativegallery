import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { extname, posix } from 'node:path';

/** An original from MEDIA_ROOT, hashed before it is sent. */
export interface LocalFile {
  path: string;
  size: number;
  sha256: string;
  md5: string;
  contentType: string;
}

/** What a storage reports about a file without downloading it. Checksums are given when the storage keeps them. */
export interface RemoteStat {
  size: number;
  sha256?: string;
  md5?: string;
  remoteId?: string;
}

/**
 * One external storage. `key` is the file's path relative to MEDIA_ROOT (cdn/img/….jpg); drivers add their own prefix.
 * `remoteId` is what `put` returned last time (the Google Drive file id), so lookups need no search.
 */
export interface StorageDriver {
  put(key: string, file: LocalFile, remoteId?: string | null): Promise<{ remoteId?: string }>;
  /** null when the file is not there. */
  stat(key: string, remoteId?: string | null): Promise<RemoteStat | null>;
  /** SHA-256 of the stored content (downloads it); null when the file is not there. */
  hash(key: string, remoteId?: string | null): Promise<string | null>;
  remove(key: string, remoteId?: string | null): Promise<void>;
}

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8',
};

export function contentType(path: string) {
  return contentTypes[extname(path).toLowerCase()] ?? 'application/octet-stream';
}

/** Size, SHA-256 and MD5 of a local file in one streaming pass. */
export function hashFile(path: string): Promise<{ size: number; sha256: string; md5: string }> {
  return new Promise((resolve, reject) => {
    const sha256 = createHash('sha256');
    const md5 = createHash('md5');
    let size = 0;
    createReadStream(path)
      .on('data', chunk => { size += chunk.length; sha256.update(chunk); md5.update(chunk); })
      .on('error', reject)
      .on('end', () => resolve({ size, sha256: sha256.digest('hex'), md5: md5.digest('hex') }));
  });
}

export async function localFile(path: string): Promise<LocalFile> {
  return { path, ...await hashFile(path), contentType: contentType(path) };
}

/** A relative media path that cannot climb out of its root: forward slashes, no empty, `.` or `..` segments. */
export function safeKey(key: string) {
  const parts = key.split('/');
  if (!key || key.length > 512 || parts.some(part => !part || part === '.' || part === '..' || /[\\\0]/.test(part))) {
    throw new Error('Недопустимый путь файла: ' + key);
  }
  return key;
}

/** The storage's prefix joined to a key, without leading or doubled slashes. */
export function prefixed(prefix: string | undefined, key: string) {
  const clean = (prefix ?? '').split('/').filter(Boolean).join('/');
  return clean ? posix.join(clean, safeKey(key)) : safeKey(key);
}

/** RFC 3986 encoding of each path segment (what S3 signatures and WebDAV servers expect). */
export function encodePath(path: string) {
  return path.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())).join('/');
}
