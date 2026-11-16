import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(new URL('../packages/storage/package.json', import.meta.url));
const storage = require('./dist/index.js');

test('SigV4 matches the GET Object example of the S3 documentation', () => {
  const headers = storage.signV4({
    method: 'GET', url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'), headers: { range: 'bytes=0-9' },
    payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', region: 'us-east-1',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', date: new Date('2013-05-24T00:00:00Z'),
  });
  assert.equal(headers.authorization, 'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, ' +
    'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41');
});

test('photo media files are paths inside MEDIA_ROOT', () => {
  assert.deepEqual(storage.photoMediaFiles({ photourl: '/uploads/cdn/img/a.jpg', content: JSON.stringify({ videourl: '/uploads/cdn/video/a.mp4' }) }),
    ['cdn/img/a.jpg', 'cdn/video/a.mp4']);
  assert.deepEqual(storage.photoMediaFiles({ photourl: 'https://old.example/a.jpg', content: '{}' }), []);
  assert.deepEqual(storage.photoMediaFiles({ photourl: '/uploads/../etc/passwd', content: 'not json' }), []);
  assert.throws(() => storage.prefixed('x', 'a/../b'));
  assert.equal(storage.prefixed('/backup//ng/', 'cdn/img/a.jpg'), 'backup/ng/cdn/img/a.jpg');
});

test('disk storage publishes, checks and deletes files, and refuses a missing mount', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ng-disk-'));
  try {
    const result = await storage.testStorage('disk', { path: root });
    assert.equal(result.ok, true, result.message);
    const missing = await storage.testStorage('disk', { path: join(root, 'not-mounted') });
    assert.equal(missing.ok, false);
    assert.match(missing.message, /не найдена/);
    assert.equal((await storage.testStorage('disk', { path: 'relative/path' })).ok, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

/** A tiny in-memory WebDAV server: MKCOL, PUT, PROPFIND (depth 0), GET, DELETE behind basic auth. */
function webdavServer() {
  const files = new Map();
  const folders = new Set(['/', '/dav/']);
  const server = createServer((request, response) => {
    if (request.headers.authorization !== 'Basic ' + Buffer.from('user:secret').toString('base64')) { response.writeHead(401).end(); return; }
    const path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      const parent = path.replace(/\/[^/]+\/?$/, '/');
      switch (request.method) {
        case 'MKCOL':
          if (folders.has(path)) return response.writeHead(405).end();
          if (!folders.has(parent)) return response.writeHead(409).end();
          folders.add(path); return response.writeHead(201).end();
        case 'PUT':
          if (!folders.has(parent)) return response.writeHead(409).end();
          files.set(path, Buffer.concat(chunks)); return response.writeHead(201).end();
        case 'PROPFIND':
          if (folders.has(path)) return response.writeHead(207).end('<d:multistatus xmlns:d="DAV:"><d:response><d:propstat><d:prop><d:resourcetype><d:collection/></d:resourcetype></d:prop></d:propstat></d:response></d:multistatus>');
          if (!files.has(path)) return response.writeHead(404).end();
          return response.writeHead(207).end('<d:multistatus xmlns:d="DAV:"><d:response><d:propstat><d:prop><d:getcontentlength>' + files.get(path).length + '</d:getcontentlength><d:resourcetype/></d:prop></d:propstat></d:response></d:multistatus>');
        case 'GET':
          if (!files.has(path)) return response.writeHead(404).end();
          return response.writeHead(200).end(files.get(path));
        case 'DELETE':
          return response.writeHead(files.delete(path) ? 204 : 404).end();
      }
      response.writeHead(405).end();
    });
  });
  return { server, files };
}

test('WebDAV storage creates folders, uploads, verifies and deletes', async () => {
  const { server, files } = webdavServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const directory = await mkdtemp(join(tmpdir(), 'ng-dav-'));
  try {
    const config = { url: 'http://127.0.0.1:' + server.address().port + '/dav', username: 'user', password: 'secret', prefix: 'gallery' };
    const result = await storage.testStorage('webdav', config);
    assert.equal(result.ok, true, result.message);

    const driver = storage.createDriver('webdav', config);
    const path = join(directory, 'photo.jpg');
    await writeFile(path, Buffer.alloc(70_000, 7));
    const file = await storage.localFile(path);
    await driver.put('cdn/img/photo.jpg', file);
    assert.ok(files.has('/dav/gallery/cdn/img/photo.jpg'));
    assert.deepEqual(await driver.stat('cdn/img/photo.jpg'), { size: 70_000 });
    assert.equal(await driver.hash('cdn/img/photo.jpg'), file.sha256);
    await driver.remove('cdn/img/photo.jpg');
    assert.equal(await driver.stat('cdn/img/photo.jpg'), null);

    const denied = await storage.testStorage('webdav', { ...config, password: 'wrong' });
    assert.equal(denied.ok, false);
    assert.match(denied.message, /401/);
  } finally {
    server.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('S3 storage streams signed uploads and reads metadata back (path-style)', async () => {
  const { createHash } = await import('node:crypto');
  const objects = new Map();
  const server = createServer((request, response) => {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      if (!/^AWS4-HMAC-SHA256 Credential=key\/\d{8}\/auto\/s3\/aws4_request, SignedHeaders=[^,]+, Signature=[0-9a-f]{64}$/.test(request.headers.authorization ?? '')) {
        return response.writeHead(403).end('<Error><Code>AccessDenied</Code><Message>bad signature</Message></Error>');
      }
      const path = new URL(request.url, 'http://x').pathname;
      const body = Buffer.concat(chunks);
      if (createHash('sha256').update(body).digest('hex') !== request.headers['x-amz-content-sha256']) return response.writeHead(400).end('<Error><Code>XAmzContentSHA256Mismatch</Code></Error>');
      const object = objects.get(path);
      switch (request.method) {
        case 'PUT':
          objects.set(path, { body, sha: request.headers['x-amz-meta-sha256'], md5: createHash('md5').update(body).digest('hex') });
          return response.writeHead(200, { etag: '"' + createHash('md5').update(body).digest('hex') + '"' }).end();
        case 'HEAD':
          if (!object) return response.writeHead(404).end();
          return response.writeHead(200, { 'content-length': object.body.length, etag: '"' + object.md5 + '"', 'x-amz-meta-sha256': object.sha }).end();
        case 'GET':
          if (!object) return response.writeHead(404).end();
          return response.writeHead(200).end(object.body);
        case 'DELETE':
          objects.delete(path); return response.writeHead(204).end();
      }
      response.writeHead(405).end();
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const directory = await mkdtemp(join(tmpdir(), 'ng-s3-'));
  try {
    const config = { endpoint: 'http://127.0.0.1:' + server.address().port, region: 'auto', bucket: 'media', accessKeyId: 'key', secretAccessKey: 'secret', pathStyle: 'true', prefix: 'ng' };
    const result = await storage.testStorage('s3', config);
    assert.equal(result.ok, true, result.message);
    const driver = storage.createDriver('s3', config);
    const path = join(directory, 'clip.mp4');
    await writeFile(path, Buffer.alloc(300_000, 3));
    const file = await storage.localFile(path);
    await driver.put('cdn/video/clip.mp4', file);
    assert.ok(objects.has('/media/ng/cdn/video/clip.mp4'));
    assert.deepEqual(await driver.stat('cdn/video/clip.mp4'), { size: 300_000, md5: file.md5, sha256: file.sha256 });
    assert.equal(await driver.stat('cdn/video/none.mp4'), null);
    const denied = await storage.testStorage('s3', { ...config, accessKeyId: 'other' });
    assert.match(denied.message, /bad signature/);
  } finally {
    server.close();
    await rm(directory, { recursive: true, force: true });
  }
});
