import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ApiModule } = require('./dist/ApiModule.js');

test('production NestJS registers public and protected routes', { timeout: 15_000 }, async () => {
  const app = await NestFactory.create(ApiModule, { logger: false, abortOnError: false });
  try {
    await app.listen(0, '127.0.0.1');
    const origin = await app.getUrl();
    const health = await fetch(origin + '/api/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });

    const options = await fetch(origin + '/api/register/options');
    assert.equal(options.status, 200);
    assert.equal(typeof (await options.json()).open, 'boolean');
    assert.equal(options.headers.get('cache-control'), 'private, no-store');

    for (const path of ['/api/upload/options', '/api/photo/loadmap', '/api/admin/pages', '/api/admin/galleries', '/api/account/photos/7']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 403, path);
      await response.text();
    }

    const vote = await fetch(origin + '/api/photo/comment/rate?wid=1&vote=1');
    assert.equal(vote.status, 403);
    for (const path of ['', '/1/edit', '/1/delete', '/1/pin']) {
      const response = await fetch(origin + '/api/photo/comment' + path, {
        method: 'POST',
        body: new URLSearchParams({ id: '1', wtext: 'test', value: 'test' }),
      });
      assert.equal(response.status, 403, path);
    }

    const robots = await fetch(origin + '/api/robots.txt', { headers: { 'x-forwarded-host': 'gallery.test' } });
    assert.equal(robots.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.match(await robots.text(), /Disallow: \/lk\/[\s\S]*Host: https:\/\/gallery\.test$/);
    const sort = await fetch(origin + '/api/internal/account/upload-sort?lk_upl_sort=2', { redirect: 'manual' });
    assert.equal(sort.status, 302);
    assert.equal(sort.headers.get('location'), '/lk/history');
    assert.match(sort.headers.get('set-cookie'), /^lk_upl_sort=2; Path=\/lk; HttpOnly; SameSite=Lax$/);
    assert.equal((await fetch(origin + '/api/internal/account/upload-sort?lk_upl_sort=9')).status, 400);
    const theme = await fetch(origin + '/api/profile/theme', {
      method: 'POST', body: new URLSearchParams({ theme_id: 'nativegallery-dark' }), redirect: 'manual',
    });
    assert.equal(theme.status, 303);
    assert.equal(theme.headers.get('location'), '/login');

    const invalid = await fetch(origin + '/api/users/emailverify?token=invalid');
    assert.equal(invalid.status, 404);
    const missing = await fetch(origin + '/api/users/load/invalid');
    assert.equal(missing.status, 200);
    assert.equal((await missing.json()).error, 1);
  } finally {
    await app.close();
  }
});
