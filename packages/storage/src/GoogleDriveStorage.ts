import { createHash, createSign } from 'node:crypto';
import { posix } from 'node:path';
import { safeKey, type LocalFile, type RemoteStat, type StorageDriver } from './Driver';
import { failure, http, type HttpOptions } from './Http';

const api = 'https://www.googleapis.com/drive/v3/files';
const upload = 'https://www.googleapis.com/upload/drive/v3/files';
const scope = 'https://www.googleapis.com/auth/drive';
const fields = 'id,size,md5Checksum,sha256Checksum,trashed';

/** Access tokens by credentials, shared by every driver instance of the process until they expire. */
const tokens = new Map<string, { token: string; expires: number }>();

interface DriveFile { id: string; size?: string; md5Checksum?: string; sha256Checksum?: string; trashed?: boolean }

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/**
 * A Google Drive folder. Files keep their base name and carry the media path in appProperties.ngkey, which is how
 * they are found again when the stored file id is unknown. Shared drives are supported (supportsAllDrives).
 */
export class GoogleDriveStorage implements StorageDriver {
  private readonly folderId: string;
  private readonly account?: { client_email: string; private_key: string; token_uri?: string };

  constructor(private readonly config: Record<string, string>) {
    this.folderId = (config.folderId ?? '').trim();
    if (!/^[\w-]{10,}$/.test(this.folderId)) throw new Error('Укажите ID папки Google Drive.');
    if (config.serviceAccount?.trim()) {
      try { this.account = JSON.parse(config.serviceAccount); } catch { throw new Error('Ключ сервисного аккаунта — не JSON.'); }
      if (!this.account?.client_email || !this.account.private_key) throw new Error('В ключе нет client_email или private_key.');
    } else if (!config.clientId || !config.clientSecret || !config.refreshToken) {
      throw new Error('Укажите ключ сервисного аккаунта или Client ID, Client secret и Refresh token.');
    }
  }

  private async token() {
    const id = createHash('sha256').update(this.account ? this.account.client_email + this.account.private_key : this.config.clientId + this.config.refreshToken).digest('hex');
    const cached = tokens.get(id);
    if (cached && cached.expires > Date.now() + 60_000) return cached.token;
    let body: URLSearchParams;
    let endpoint = 'https://oauth2.googleapis.com/token';
    if (this.account) {
      endpoint = this.account.token_uri || endpoint;
      const now = Math.floor(Date.now() / 1000);
      const unsigned = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' +
        base64url(JSON.stringify({ iss: this.account.client_email, scope, aud: endpoint, iat: now, exp: now + 3600 }));
      const signature = createSign('RSA-SHA256').update(unsigned).sign(this.account.private_key);
      body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + base64url(signature) });
    } else {
      body = new URLSearchParams({
        grant_type: 'refresh_token', client_id: this.config.clientId, client_secret: this.config.clientSecret, refresh_token: this.config.refreshToken,
      });
    }
    const response = await http(endpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    if (response.status !== 200) throw failure('Google OAuth', response);
    const json = JSON.parse(response.body.toString('utf8'));
    tokens.set(id, { token: json.access_token, expires: Date.now() + Number(json.expires_in ?? 3600) * 1000 });
    return json.access_token as string;
  }

  private async send(url: string | URL, options: HttpOptions = {}) {
    return http(url, { ...options, headers: { authorization: 'Bearer ' + await this.token(), ...options.headers } });
  }

  private async json<T>(url: string | URL, options: HttpOptions = {}, what = 'Google Drive'): Promise<T | null> {
    const response = await this.send(url, options);
    if (response.status === 404) return null;
    if (response.status < 200 || response.status >= 300) throw failure(what, response);
    return response.body.length ? JSON.parse(response.body.toString('utf8')) : ({} as T);
  }

  private async find(key: string): Promise<DriveFile | null> {
    const quote = (value: string) => "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    const query = new URLSearchParams({
      q: quote(this.folderId) + ' in parents and trashed = false and appProperties has { key=\'ngkey\' and value=' + quote(key) + ' }',
      fields: 'files(' + fields + ')', pageSize: '10', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true', corpora: 'allDrives',
    });
    const result = await this.json<{ files: DriveFile[] }>(api + '?' + query, {}, 'Google Drive: поиск');
    return result?.files?.[0] ?? null;
  }

  private async file(key: string, remoteId?: string | null): Promise<DriveFile | null> {
    if (remoteId) {
      const file = await this.json<DriveFile>(api + '/' + encodeURIComponent(remoteId) + '?fields=' + fields + '&supportsAllDrives=true');
      if (file && !file.trashed) return file;
    }
    return this.find(key);
  }

  async put(key: string, file: LocalFile, remoteId?: string | null) {
    safeKey(key);
    const existing = await this.file(key, remoteId);
    // A resumable session: the metadata first, then the content in one PUT, so large videos are streamed from disk.
    const session = existing
      ? await this.send(upload + '/' + encodeURIComponent(existing.id) + '?uploadType=resumable&supportsAllDrives=true&fields=id', {
        method: 'PATCH', headers: { 'content-type': 'application/json; charset=utf-8', 'x-upload-content-type': file.contentType, 'x-upload-content-length': String(file.size) },
        body: '{}',
      })
      : await this.send(upload + '?uploadType=resumable&supportsAllDrives=true&fields=id', {
        method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8', 'x-upload-content-type': file.contentType, 'x-upload-content-length': String(file.size) },
        body: JSON.stringify({ name: posix.basename(key), parents: [this.folderId], appProperties: { ngkey: key } }),
      });
    const location = session.headers.location;
    if (session.status !== 200 || !location) throw failure('Google Drive: начало загрузки', session);
    const response = await http(location, {
      method: 'PUT', headers: { 'content-type': file.contentType }, body: { path: file.path, size: file.size }, idleTimeout: 120_000,
    });
    if (response.status !== 200 && response.status !== 201) throw failure('Google Drive: загрузка', response);
    const created = JSON.parse(response.body.toString('utf8')) as DriveFile;
    return { remoteId: created.id };
  }

  async stat(key: string, remoteId?: string | null): Promise<RemoteStat | null> {
    const file = await this.file(key, remoteId);
    if (!file) return null;
    return { size: Number(file.size ?? -1), md5: file.md5Checksum?.toLowerCase(), sha256: file.sha256Checksum?.toLowerCase(), remoteId: file.id };
  }

  async hash(key: string, remoteId?: string | null) {
    const file = await this.file(key, remoteId);
    if (!file) return null;
    const response = await this.send(api + '/' + encodeURIComponent(file.id) + '?alt=media&supportsAllDrives=true', { hash: true, idleTimeout: 120_000 });
    if (response.status === 404) return null;
    if (response.status !== 200) throw failure('Google Drive: скачивание', response);
    return response.sha256 ?? null;
  }

  async remove(key: string, remoteId?: string | null) {
    const file = await this.file(key, remoteId);
    if (!file) return;
    const response = await this.send(api + '/' + encodeURIComponent(file.id) + '?supportsAllDrives=true', { method: 'DELETE' });
    if (![200, 204, 404].includes(response.status)) throw failure('Google Drive: удаление', response);
  }
}
