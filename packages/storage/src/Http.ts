import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http';
import { request as httpsRequest } from 'node:https';

/** A local file sent as the request body, streamed rather than read into memory (videos can be large). */
export interface FileBody { path: string; size: number }

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Buffer | string | FileBody;
  /** Stream a successful (2xx) response body into SHA-256 instead of buffering it. */
  hash?: boolean;
  /** Socket inactivity limit; a transfer that keeps moving is never cut off. */
  idleTimeout?: number;
}

export interface HttpResponse {
  status: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
  sha256?: string;
}

const bufferLimit = 8 * 1024 * 1024;

/**
 * A minimal HTTP client over node:http(s): explicit Content-Length for streamed uploads (S3 refuses chunked bodies),
 * streamed hashing of downloads and redirects followed for GET/HEAD/PROPFIND.
 */
export async function http(url: string | URL, options: HttpOptions = {}, redirects = 3): Promise<HttpResponse> {
  const target = typeof url === 'string' ? new URL(url) : url;
  if (target.protocol !== 'https:' && target.protocol !== 'http:') throw new Error('Неподдерживаемый адрес: ' + target.protocol);
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { 'user-agent': 'NativeGallery', ...options.headers };
  const body = options.body;
  if (body !== undefined) {
    headers['content-length'] = String(typeof body === 'string' ? Buffer.byteLength(body) : Buffer.isBuffer(body) ? body.length : body.size);
  }
  const send = target.protocol === 'https:' ? httpsRequest : httpRequest;

  const response = await new Promise<HttpResponse>((resolve, reject) => {
    const request = send(target, { method, headers }, incoming => {
      const status = incoming.statusCode ?? 0;
      if (options.hash && status >= 200 && status < 300) {
        const digest = createHash('sha256');
        incoming.on('data', chunk => digest.update(chunk));
        incoming.on('end', () => resolve({ status, headers: incoming.headers, body: Buffer.alloc(0), sha256: digest.digest('hex') }));
        incoming.on('error', reject);
        return;
      }
      const chunks: Buffer[] = [];
      let length = 0;
      incoming.on('data', (chunk: Buffer) => {
        length += chunk.length;
        if (length <= bufferLimit) chunks.push(chunk);
      });
      incoming.on('end', () => resolve({ status, headers: incoming.headers, body: Buffer.concat(chunks) }));
      incoming.on('error', reject);
    });
    request.setTimeout(options.idleTimeout ?? 60_000, () => request.destroy(new Error('Сервер не отвечает: ' + target.host)));
    request.on('error', reject);
    if (body === undefined) request.end();
    else if (typeof body === 'string' || Buffer.isBuffer(body)) request.end(body);
    else {
      const stream = createReadStream(body.path);
      stream.on('error', error => request.destroy(error));
      stream.pipe(request);
    }
  });

  const location = response.headers.location;
  if (redirects > 0 && location && [301, 302, 303, 307, 308].includes(response.status) && ['GET', 'HEAD', 'PROPFIND'].includes(method)) {
    return http(new URL(location, target), options, redirects - 1);
  }
  return response;
}

/** A short readable reason from an error response: XML <Message>/<Code>, a JSON error message, or the status. */
export function failure(prefix: string, response: HttpResponse) {
  const text = response.body.toString('utf8', 0, Math.min(response.body.length, 4000));
  let detail = /<(?:\w+:)?Message>([^<]+)</.exec(text)?.[1] ?? /<(?:\w+:)?Code>([^<]+)</.exec(text)?.[1];
  if (!detail) {
    try {
      const json = JSON.parse(text);
      detail = json?.error?.message ?? json?.error_description ?? (typeof json?.error === 'string' ? json.error : undefined);
    } catch {}
  }
  return new Error(prefix + ': HTTP ' + response.status + (detail ? ' — ' + String(detail).trim().slice(0, 300) : ''));
}
