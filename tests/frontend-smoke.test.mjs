import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

const frontend = new URL('../apps/frontend/', import.meta.url);
const require = createRequire(new URL('package.json', frontend));

test('production frontend serves legacy HTML and native scripts', { timeout: 20_000 }, async () => {
  const api = createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const fixtures = {
      '/api/register/options': { open: true },
      '/api/internal/home': { popular: [], random: [], online: [], news: [], recent: [], contest: null },
      '/api/internal/about': { users: 5, photos: 8, online: 1, staff: [] },
    };
    response.end(JSON.stringify(fixtures[request.url] ?? { viewer: null, databaseVersion: 'test' }));
  });
  api.listen(0, '127.0.0.1');
  await once(api, 'listening');

  const next = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', '0', '-H', '127.0.0.1'], {
    cwd: frontend,
    env: { ...process.env, API_ORIGIN: 'http://127.0.0.1:' + api.address().port },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  next.stdout.on('data', data => { output += data; });
  next.stderr.on('data', data => { output += data; });

  try {
    let origin;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (next.exitCode !== null) break;
      origin = output.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+)/)?.[1];
      if (origin && output.includes('Ready')) break;
      await delay(100);
    }
    assert.ok(origin, output);
    for (const [path, status, marker] of [
      ['/', 200, 'Недавно добавленные фотографии'],
      ['/about', 200, 'Зарегистрировано пользователей'],
      ['/rules', 200, 'Правила сайта'],
      ['/tour', 200, 'data-tour-tab'],
      ['/login', 200, 'loginbtn'],
      ['/register', 200, 'regbtn'],
      ['/missing-smoke', 404, 'Not Found'],
    ]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, status, path);
      assert.match(response.headers.get('content-type'), /text\/html/);
      const html = await response.text();
      assert.ok(html.includes(marker), path);
      assert.doesNotMatch(html, /__SCRIPT_|<script[^>]+jquery/i);
    }
    const script = await fetch(origin + '/frontend-scripts/Register.js');
    assert.equal(script.status, 200);
    assert.match(await script.text(), /addEventListener/);
  } finally {
    next.kill();
    api.close();
  }
});
