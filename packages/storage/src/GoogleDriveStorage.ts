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
    if (config.serviceAccount?.trim()) {
      try { this.account = JSON.parse(config.serviceAccount); } catch { throw new Error('Ключ сервисного аккаунта — не JSON.'); }
      if (!this.account?.client_email || !this.account.private_key) throw new Error('В ключе нет client_email или private_key.');
      if (!this.folderId) throw new Error('Для сервисного аккаунта укажите ID папки на общем диске.');
    } else if (!config.clientId || !config.clientSecret) {
      throw new Error('Укажите Client ID и Client secret OAuth-клиента или ключ сервисного аккаунта.');
    } else if (!config.refreshToken) {
      throw new Error('Аккаунт Google не подключён: нажмите «Войти через Google».');
    }
    if (!/^[\w-]{10,}$/.test(this.folderId)) throw new Error('Укажите ID папки Google Drive.');
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

const authorizeEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
const tokenEndpoint = 'https://oauth2.googleapis.com/token';
/** Only the files the site creates itself; enough when the site makes its own folder. */
const fileScope = 'https://www.googleapis.com/auth/drive.file';

/**
 * Where to send the owner for «Войти через Google». With an existing folder of theirs the site needs the whole Drive;
 * otherwise it creates its own folder and asks only for its own files.
 */
export function googleAuthorizeUrl({ clientId, redirectUri, state, fullAccess }: { clientId: string; redirectUri: string; state: string; fullAccess: boolean }) {
  return authorizeEndpoint + '?' + new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code', state,
    scope: [fullAccess ? scope : fileScope, 'openid', 'email'].join(' '),
    // A refresh token is issued only with offline access, and again for an account that signed in before only with consent.
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true',
  });
}

/** Trades the code from the Google redirect for a refresh token and the account's address. */
export async function googleExchangeCode({ clientId, clientSecret, code, redirectUri }: { clientId: string; clientSecret: string; code: string; redirectUri: string }) {
  const response = await http(tokenEndpoint, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }).toString(),
  });
  if (response.status !== 200) throw failure('Google OAuth', response);
  return granted(JSON.parse(response.body.toString('utf8')));
}

interface TokenReply { access_token: string; refresh_token?: string; id_token?: string; scope?: string }

/** The refresh token and the account's address from a token reply that should grant Drive access. */
function granted(json: TokenReply) {
  if (!json.refresh_token) throw new Error('Google не выдал refresh token. Отзовите доступ сайта в настройках аккаунта Google и войдите снова.');
  if (!json.scope?.split(' ').some(item => item === scope || item === fileScope)) throw new Error('Не выдан доступ к Google Drive: отметьте его на экране согласия.');
  // The ID token comes straight from Google's token endpoint over TLS, so its claims can be read without checking the signature.
  let email = '';
  try { email = String(JSON.parse(Buffer.from(json.id_token?.split('.')[1] ?? '', 'base64url').toString('utf8')).email ?? ''); } catch {}
  return { accessToken: json.access_token, refreshToken: json.refresh_token, email };
}

/**
 * Sign-in with a code («TVs and Limited Input devices» client): Google shows the owner a page where they type the code,
 * so the site needs no redirect URI. Such clients may only ask for the site's own files (drive.file).
 */
export async function googleDeviceStart(clientId: string) {
  const response = await http('https://oauth2.googleapis.com/device/code', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, scope: [fileScope, 'openid', 'email'].join(' ') }).toString(),
  });
  if (response.status !== 200) throw failure('Google OAuth', response);
  const json = JSON.parse(response.body.toString('utf8')) as { device_code: string; user_code: string; verification_url?: string; verification_uri?: string; expires_in: number; interval?: number };
  return {
    deviceCode: json.device_code, userCode: json.user_code, verificationUrl: json.verification_url ?? json.verification_uri ?? 'https://www.google.com/device',
    expiresIn: Number(json.expires_in) || 1800, interval: Number(json.interval) || 5,
  };
}

export type GoogleDeviceResult =
  | { status: 'pending' | 'slow_down' | 'denied' | 'expired' }
  | { status: 'granted'; accessToken: string; refreshToken: string; email: string };

/** Asks Google whether the owner has entered the code and allowed access yet. */
export async function googleDevicePoll({ clientId, clientSecret, deviceCode }: { clientId: string; clientSecret: string; deviceCode: string }): Promise<GoogleDeviceResult> {
  const response = await http(tokenEndpoint, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret, device_code: deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }).toString(),
  });
  if (response.status === 200) return { status: 'granted', ...granted(JSON.parse(response.body.toString('utf8'))) };
  let error = '';
  try { error = String(JSON.parse(response.body.toString('utf8')).error ?? ''); } catch {}
  if (error === 'authorization_pending') return { status: 'pending' };
  if (error === 'slow_down') return { status: 'slow_down' };
  if (error === 'access_denied') return { status: 'denied' };
  if (error === 'expired_token') return { status: 'expired' };
  throw failure('Google OAuth', response);
}

/**
 * The site's own folder in the account's «Мой диск»: the one it made before (with drive.file the site sees only its own
 * files, so a folder of that name is its own), or a new one.
 */
export async function googleOwnFolder(accessToken: string, name: string) {
  const quoted = "'" + name.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const query = new URLSearchParams({
    q: 'name = ' + quoted + " and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false",
    fields: 'files(id)', pageSize: '1', orderBy: 'createdTime',
  });
  const found = await http(api + '?' + query, { headers: { authorization: 'Bearer ' + accessToken } });
  if (found.status !== 200) throw failure('Google Drive: поиск папки', found);
  const existing = (JSON.parse(found.body.toString('utf8')) as { files?: { id: string }[] }).files?.[0];
  if (existing) return existing.id;
  const response = await http(api + '?fields=id', {
    method: 'POST', headers: { authorization: 'Bearer ' + accessToken, 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (response.status !== 200) throw failure('Google Drive: создание папки', response);
  return (JSON.parse(response.body.toString('utf8')) as { id: string }).id;
}
