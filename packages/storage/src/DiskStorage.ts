import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { hashFile, safeKey, type LocalFile, type StorageDriver } from './Driver';

/**
 * A folder on another disk (or an NFS/SMB mount). The folder itself must already exist: if a mount is missing, writing
 * would otherwise silently fill the system disk under the empty mount point.
 */
export class DiskStorage implements StorageDriver {
  private readonly root: string;

  constructor(config: Record<string, string>) {
    if (!config.path || !isAbsolute(config.path)) throw new Error('Укажите абсолютный путь к папке.');
    this.root = resolve(config.path);
  }

  private async path(key: string) {
    const root = await stat(this.root).catch(() => null);
    if (!root?.isDirectory()) throw new Error('Папка ' + this.root + ' не найдена: диск не подключён или путь неверный.');
    return join(this.root, ...safeKey(key).split('/'));
  }

  async put(key: string, file: LocalFile) {
    const path = await this.path(key);
    await mkdir(dirname(path), { recursive: true });
    const temporary = join(dirname(path), '.' + randomUUID() + '.part');
    try {
      await copyFile(file.path, temporary);
      await rename(temporary, path);
    } finally {
      await rm(temporary, { force: true });
    }
    return {};
  }

  async stat(key: string) {
    const file = await stat(await this.path(key)).catch(() => null);
    return file?.isFile() ? { size: file.size } : null;
  }

  async hash(key: string) {
    const path = await this.path(key);
    const file = await stat(path).catch(() => null);
    return file?.isFile() ? (await hashFile(path)).sha256 : null;
  }

  async remove(key: string) {
    await rm(await this.path(key), { force: true });
  }
}
