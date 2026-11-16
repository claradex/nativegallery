import { createHash, createHmac } from 'node:crypto';
import { encodePath, prefixed, type LocalFile, type StorageDriver } from './Driver';
import { failure, http, type HttpOptions } from './Http';

const emptyHash = createHash('sha256').digest('hex');

const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const hmac = (key: string | Buffer, value: string) => createHmac('sha256', key).update(value).digest();

export interface SignInput {
  method: string;
  url: URL;
  headers: Record<string, string>;
  payloadHash: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  date: Date;
  service?: string;
}

/**
 * AWS Signature Version 4: returns the headers to send, `authorization` included. Every given header is signed, so
 * callers pass only what goes on the wire (host, x-amz-*, content-type).
 */
export function signV4({ method, url, headers, payloadHash, region, accessKeyId, secretAccessKey, date, service = 's3' }: SignInput) {
  const stamp = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const day = stamp.slice(0, 8);
  const all: Record<string, string> = {};
  for (const [name, value] of Object.entries({ ...headers, host: url.host, 'x-amz-date': stamp, 'x-amz-content-sha256': payloadHash })) {
    all[name.toLowerCase()] = String(value).trim().replace(/\s+/g, ' ');
  }
  const names = Object.keys(all).sort();
  const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase());
  const query = [...url.searchParams].map(([key, value]) => [encode(key), encode(value)])
    .sort(([a, x], [b, y]) => a < b ? -1 : a > b ? 1 : x < y ? -1 : x > y ? 1 : 0).map(pair => pair.join('=')).join('&');
  const canonical = [method, url.pathname || '/', query, names.map(name => name + ':' + all[name] + '\n').join(''), names.join(';'), payloadHash].join('\n');
  const scope = day + '/' + region + '/' + service + '/aws4_request';
  const toSign = ['AWS4-HMAC-SHA256', stamp, scope, sha256(canonical)].join('\n');
  const key = hmac(hmac(hmac(hmac('AWS4' + secretAccessKey, day), region), service), 'aws4_request');
  const signature = createHmac('sha256', key).update(toSign).digest('hex');
  return {
    ...all,
    authorization: 'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + scope + ', SignedHeaders=' + names.join(';') + ', Signature=' + signature,
  };
}

/** Amazon S3 and compatible services (R2, MinIO, Yandex Object Storage …), path-style or virtual-hosted. */
export class S3Storage implements StorageDriver {
  private readonly region: string;

  constructor(private readonly config: Record<string, string>) {
    if (!config.bucket) throw new Error('Укажите бакет.');
    if (!config.accessKeyId || !config.secretAccessKey) throw new Error('Укажите ключи доступа.');
    this.region = config.region?.trim() || 'us-east-1';
  }

  private url(key: string) {
    const objectPath = '/' + encodePath(prefixed(this.config.prefix, key));
    const endpoint = new URL(this.config.endpoint?.trim() || 'https://s3.' + this.region + '.amazonaws.com');
    const base = endpoint.pathname.replace(/\/+$/, '');
    if (this.config.pathStyle === 'true') return new URL(endpoint.origin + base + '/' + encodeURIComponent(this.config.bucket) + objectPath);
    return new URL(endpoint.protocol + '//' + this.config.bucket + '.' + endpoint.host + base + objectPath);
  }

  private send(method: string, key: string, options: Omit<HttpOptions, 'method'> & { payloadHash?: string } = {}) {
    const url = this.url(key);
    const headers = signV4({
      method, url, headers: options.headers ?? {}, payloadHash: options.payloadHash ?? emptyHash, region: this.region,
      accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey, date: new Date(),
    });
    return http(url, { ...options, method, headers }, 0);
  }

  async put(key: string, file: LocalFile) {
    const response = await this.send('PUT', key, {
      headers: { 'content-type': file.contentType, 'x-amz-meta-sha256': file.sha256 },
      payloadHash: file.sha256, body: { path: file.path, size: file.size }, idleTimeout: 120_000,
    });
    if (response.status !== 200) throw failure('S3 PUT', response);
    return {};
  }

  async stat(key: string) {
    const response = await this.send('HEAD', key);
    if (response.status === 404) return null;
    if (response.status !== 200) throw failure('S3 HEAD', response);
    const etag = String(response.headers.etag ?? '').replace(/"/g, '');
    const metaHash = response.headers['x-amz-meta-sha256'];
    return {
      size: Number(response.headers['content-length'] ?? -1),
      // A multipart upload's ETag is not an MD5 of the content (it carries a -N suffix).
      md5: /^[0-9a-f]{32}$/i.test(etag) ? etag.toLowerCase() : undefined,
      sha256: typeof metaHash === 'string' && /^[0-9a-f]{64}$/i.test(metaHash) ? metaHash.toLowerCase() : undefined,
    };
  }

  async hash(key: string) {
    const response = await this.send('GET', key, { hash: true, idleTimeout: 120_000 });
    if (response.status === 404) return null;
    if (response.status !== 200) throw failure('S3 GET', response);
    return response.sha256 ?? null;
  }

  async remove(key: string) {
    const response = await this.send('DELETE', key);
    if (response.status !== 204 && response.status !== 200 && response.status !== 404) throw failure('S3 DELETE', response);
  }
}
