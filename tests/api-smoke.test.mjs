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

    for (const path of ['/api/upload/options', '/api/photo/loadmap', '/api/admin/pages', '/api/admin/galleries']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 403, path);
      await response.text();
    }

    const invalid = await fetch(origin + '/api/users/emailverify?token=invalid');
    assert.equal(invalid.status, 404);
    const missing = await fetch(origin + '/api/users/load/invalid');
    assert.equal(missing.status, 200);
    assert.equal((await missing.json()).error, 1);
  } finally {
    await app.close();
  }
});
