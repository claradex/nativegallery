import { encodePath, prefixed, type LocalFile, type StorageDriver } from './Driver';
import { failure, http, type HttpOptions } from './Http';

const propfind = '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:getcontentlength/><d:resourcetype/></d:prop></d:propfind>';

/** Any WebDAV server: Nextcloud/ownCloud, Яндекс Диск, Synology, Apache mod_dav, rclone serve. */
export class WebDavStorage implements StorageDriver {
  private readonly base: URL;
  private readonly authorization?: string;
  /** Folders known to exist, so MKCOL is not repeated for every file. */
  private readonly folders = new Set<string>();

  constructor(private readonly config: Record<string, string>) {
    if (!config.url) throw new Error('Укажите адрес WebDAV.');
    this.base = new URL(config.url.endsWith('/') ? config.url : config.url + '/');
    if (config.username || config.password) {
      this.authorization = 'Basic ' + Buffer.from((config.username ?? '') + ':' + (config.password ?? '')).toString('base64');
    }
  }

  private url(path: string) {
    return new URL(encodePath(path), this.base);
  }

  private send(method: string, path: string, options: Omit<HttpOptions, 'method'> = {}) {
    return http(this.url(path), {
      ...options, method, headers: { ...(this.authorization ? { authorization: this.authorization } : {}), ...options.headers },
    });
  }

  private async ensureFolders(path: string) {
    const parts = path.split('/').slice(0, -1);
    for (let depth = 1; depth <= parts.length; depth++) {
      const folder = parts.slice(0, depth).join('/') + '/';
      if (this.folders.has(folder)) continue;
      const response = await this.send('MKCOL', folder);
      // 405: already there. Some servers answer 301 for an existing collection, or 409 only when a parent is missing.
      if (![201, 301, 405].includes(response.status)) {
        const check = await this.send('PROPFIND', folder, { headers: { depth: '0', 'content-type': 'application/xml; charset=utf-8' }, body: propfind });
        if (check.status !== 207) throw failure('WebDAV MKCOL ' + folder, response);
      }
      this.folders.add(folder);
    }
  }

  async put(key: string, file: LocalFile) {
    const path = prefixed(this.config.prefix, key);
    await this.ensureFolders(path);
    const response = await this.send('PUT', path, {
      headers: { 'content-type': file.contentType }, body: { path: file.path, size: file.size }, idleTimeout: 120_000,
    });
    if (![200, 201, 204].includes(response.status)) throw failure('WebDAV PUT', response);
    return {};
  }

  async stat(key: string) {
    const response = await this.send('PROPFIND', prefixed(this.config.prefix, key), {
      headers: { depth: '0', 'content-type': 'application/xml; charset=utf-8' }, body: propfind,
    });
    if (response.status === 404) return null;
    if (response.status !== 207) throw failure('WebDAV PROPFIND', response);
    const xml = response.body.toString('utf8');
    if (/<(?:\w+:)?collection\s*\/?>/i.test(xml)) return null;
    const length = /<(?:\w+:)?getcontentlength[^>]*>\s*(\d+)\s*</i.exec(xml)?.[1];
    if (length === undefined) {
      // A server without getcontentlength in PROPFIND: fall back to the headers of a HEAD request.
      const head = await this.send('HEAD', prefixed(this.config.prefix, key));
      if (head.status === 404) return null;
      if (head.status !== 200) throw failure('WebDAV HEAD', head);
      return { size: Number(head.headers['content-length'] ?? -1) };
    }
    return { size: Number(length) };
  }

  async hash(key: string) {
    const response = await this.send('GET', prefixed(this.config.prefix, key), { hash: true, idleTimeout: 120_000 });
    if (response.status === 404) return null;
    if (response.status !== 200) throw failure('WebDAV GET', response);
    return response.sha256 ?? null;
  }

  async remove(key: string) {
    const response = await this.send('DELETE', prefixed(this.config.prefix, key));
    if (![200, 204, 404].includes(response.status)) throw failure('WebDAV DELETE', response);
  }
}
