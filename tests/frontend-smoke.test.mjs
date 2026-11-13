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
      '/api/internal/feed': [],
      '/api/internal/favorite-photos': [],
      '/api/internal/followed-photos': [],
      '/api/upload/options': { galleries: [], entities: [], username: 'Автор', uploadIndex: 5, directUpload: false },
      '/api/internal/account': { id: 9, username: 'Автор', published: 1, pending: 0, uploadIndex: null },
      '/api/internal/account/uploads': { author: { id: 9, username: 'Автор' }, photos: [] },
      '/api/internal/account/upload-index': [],
      '/api/profile/settings': { id: 9, username: 'Автор', photourl: '', fields: {} },
      '/api/internal/photo-details/3': { id: 3, author: 'Автор снимка', url: '/static/img/avatar.png', publishedAt: 0, views: 10, comments: 2 },
      '/api/internal/author/9': { id: 9, username: 'Автор снимка', photourl: '', admin: 0, registered: 0, online: 0, followers: 3, contacts: [], favorites: [] },
      '/api/internal/updates': [],
      '/api/internal/top30': [],
      '/api/users/search?q=Anna': [{ id: 12, username: 'Anna', photourl: '' }],
      '/api/internal/galleries': [{ id: 7, title: 'Тестовая галерея' }],
      '/api/internal/galleries/7': { title: 'Тестовая галерея', photos: [] },
      '/api/internal/news': [{ id: 1, time: 0, body: '<b>Тестовая новость</b>' }],
      '/api/internal/pages/4': { title: 'Тестовая страница', html: '<p>Материал</p>' },
      '/api/internal/about': { users: 5, photos: 8, online: 1, staff: [] },
    };
    fixtures['/api/internal/photo-page/3?aid=9'] = {
      id: 3, authorId: 9, author: 'Автор снимка', url: '/static/img/avatar.png',
      place: 'Место съёмки', description: '', takenAt: 0, publishedAt: 0, published: true,
      videoUrl: null, priority: 0, contestEntry: false, contestPlaces: [], exif: [], vehicle: null,
      vehicleRoute: '', previousId: 2, nextId: null, views: 1, favorite: false, signedIn: false,
      commentsEnabled: true, canComment: false, rating: null,
    };
    fixtures['/api/internal/photo-comments/3'] = [];
    if (['/api/internal/photo-page/999', '/api/internal/author/999'].includes(request.url)) response.statusCode = 404;
    if (['/api/internal/favorite-photos', '/api/internal/followed-photos'].includes(request.url) &&
        request.headers.cookie !== 'test-viewer=1') response.statusCode = 403;
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
      ['/update', 200, 'Новые фотографии за 72 часа'],
      ['/update.php?time=24', 200, 'Новые фотографии за 72 часа'],
      ['/top30', 200, '30 самых просматриваемых фото'],
      ['/authors.php?q=Anna', 200, '/author/12/'],
      ['/author/9/', 200, 'Подписка на новые фотографии этого автора'],
      ['/author/999', 200, 'Пользователь не найден'],
      ['/photoext?id=3', 200, '/api/photo/stats?id=3'],
      ['/photoext', 200, 'Изображение не найдено'],
      ['/lk/upload', 200, 'action="/api/upload"'],
      ['/lk', 200, 'Общая информация'],
      ['/lk/history', 200, 'Покинуло очередь'],
      ['/lk/pday', 200, 'История изменения индекса загрузки'],
      ['/lk/profile?type=Personalization', 200, 'action="/lk/profile/theme"'],
      ['/feed', 200, 'Лента обновлений'],
      ['/misc/', 200, '/article/7'],
      ['/article/7', 200, 'Тестовая галерея'],
      ['/news2.php', 200, '<b>Тестовая новость</b>'],
      ['/page/4', 200, '<p>Материал</p>'],
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
    const theme = await fetch(origin + '/lk/profile/theme', {
      method: 'POST', body: new URLSearchParams({ theme_id: 'nativegallery-dark' }), redirect: 'manual',
    });
    assert.equal(theme.status, 303);
    assert.equal(theme.headers.get('location'), '/lk/profile?type=Personalization');
    assert.match(theme.headers.get('set-cookie'), /NGALLERYTHEME=nativegallery-dark/);
    for (const [path, heading] of [['/fav', 'Избранные фотографии'], ['/fav_authors', 'Фотографии избранных авторов']]) {
      const guest = await fetch(origin + path, { redirect: 'manual' });
      assert.equal(guest.status, 307, path);
      assert.equal(guest.headers.get('location'), '/login');
      const member = await fetch(origin + path, { headers: { cookie: 'test-viewer=1' } });
      assert.equal(member.status, 200, path);
      assert.ok((await member.text()).includes(heading), path);
    }
    const photo = await fetch(origin + '/photo/3?aid=9');
    assert.equal(photo.status, 200);
    const photoHtml = await photo.text();
    assert.match(photoHtml, /Место съёмки/);
    assert.ok(photoHtml.includes('/photo/2/?aid=9'));
    assert.match(photoHtml, /id="navbard" style="display:none"|style="display:none" id="navbard"/);
    assert.match(photoHtml, /<script src="\/frontend-scripts\/PhotoActions.js"/);
    assert.equal((await fetch(origin + '/photo/999')).status, 404);
    const script = await fetch(origin + '/frontend-scripts/Register.js');
    assert.equal(script.status, 200);
    assert.match(await script.text(), /addEventListener/);
  } finally {
    next.kill();
    api.close();
  }
});
