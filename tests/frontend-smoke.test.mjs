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
    if (request.url === '/api/internal/logout' && request.headers.cookie === 'test-viewer=1') {
      response.writeHead(302, {
        Location: '/',
        'Set-Cookie': ['NGALLERYSESS=; Max-Age=0; Path=/', 'NGALLERYID=; Max-Age=0; Path=/'],
      });
      response.end();
      return;
    }
    response.setHeader('Content-Type', 'application/json');
    const fixtures = {
      '/api/register/options': { open: true },
      '/api/internal/home': { popular: [], random: [], online: [], news: [], recent: [], contest: null },
      '/api/internal/feed': [],
      '/api/account/photos/7': { id: 7, place: 'Место съёмки', postbody: 'Подпись' },
      '/api/admin/news': [],
      '/api/internal/comment-feed': [],
      '/api/internal/comment-feed?before=9': [{
        id: 8, photoId: 3, photoUrl: '/static/img/avatar.png', authorId: 9, author: 'Автор',
        admin: 0, photoCount: 1, body: 'Комментарий для подгрузки', postedAt: 0, positive: 0, negative: 0,
      }],
      '/api/internal/vehicle/5': { vehicle: { id: 5, title: 'Тестовая модель', fields: [] }, photos: [] },
      '/api/internal/vehicle-models': [],
      '/api/vehicles/requests/5?num=42': { labels: [], vehicles: [], limited: false, siteKey: 'test-key' },
      '/api/contests/voting': { contest: null, startsAt: 4102444800 },
      '/api/contests/results': [],
      '/api/contests/entries': { contest: null, photos: [] },
      '/api/contests/entry-options': { contests: [], photos: [] },
      '/api/internal/photo-search?id=9&page=2': { authorId: 9, total: 60, page: 2, pages: 2, photos: [] },
      '/api/internal/favorite-photos': [],
      '/api/internal/followed-photos': [],
      '/api/upload/options': { galleries: [], entities: [], username: 'Автор', uploadIndex: 5, directUpload: false },
      '/api/internal/account': { id: 9, username: 'Автор', published: 1, pending: 0, uploadIndex: null },
      '/api/internal/account/uploads?sort=0': { author: { id: 9, username: 'Автор' }, photos: [
        { id: 11, photourl: '/uploads/cdn/img/pending.jpg', place: 'Тестовое видео', posted_at: 0, endmoderation: 0, moderated: -1 },
      ] },
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
    if (request.url === '/api/internal/viewer' && request.headers.cookie === 'test-viewer=1') {
      fixtures[request.url] = { viewer: { id: 9, username: 'Автор', status: 0, admin: 0, unreadPhotos: 0, pendingPhotos: 0 }, databaseVersion: 'test' };
    }
    if (request.url === '/api/contests/entry-options' && request.headers.cookie !== 'test-viewer=1') response.statusCode = 403;
    if (request.url === '/api/internal/viewer' && ['test-admin=1', 'test-admin=2'].includes(request.headers.cookie)) {
      fixtures[request.url] = { viewer: { id: 7, username: 'Администратор', status: 0, admin: Number(request.headers.cookie.at(-1)), unreadPhotos: 0, pendingPhotos: 0 }, databaseVersion: 'test' };
    }
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
      ['/lk/editimage?id=7', 200, 'action="/api/account/photos/7"'],
      ['/lk', 200, 'Общая информация'],
      ['/lk/history', 200, 'Покинуло очередь'],
      ['/lk/pday', 200, 'История изменения индекса загрузки'],
      ['/lk/profile?type=Personalization', 200, 'action="/lk/profile?type=Personalization"'],
      ['/voting', 200, '<h1 id="countdown"'],
      ['/voting.php', 200, '<h1 id="countdown"'],
      ['/voting/results', 200, 'Победители фотоконкурса'],
      ['/voting/waiting', 200, 'Претенденты на участие в конкурсе'],
      ['/vehicle/5', 200, 'Тестовая модель'],
      ['/vehicle/edit', 200, 'id="mform"'],
      ['/vehicle/dbedit?type=5&num=42', 200, 'data-sitekey="test-key"'],
      ['/comments', 200, 'Лента комментариев'],
      ['/comments.php', 200, 'Лента комментариев'],
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
      assert.doesNotMatch(html, /<script[^>]+src="\/frontend-scripts\//);
      assert.doesNotMatch(html, /__SCRIPT_|<(?:script|link)[^>]+jquery/i);
    }
    const homeHtml = await (await fetch(origin + '/')).text();
    assert.match(homeHtml, /id="recent-photos"/);
    assert.match(homeHtml, /id="loadmore"/);
    assert.doesNotMatch(homeHtml, /src="\/frontend-scripts\/RecentPhotos\.js"/);
    const history = await fetch(origin + '/lk/history');
    const historyHtml = await history.text();
    assert.match(historyHtml, /Видео обрабатывается/);
    assert.ok(!historyHtml.includes('/uploads/cdn/img/pending.jpg'));
    const sort = await fetch(origin + '/set.php?lk_upl_sort=2', { redirect: 'manual' });
    assert.equal(sort.status, 302);
    assert.equal(sort.headers.get('location'), '/lk/history');
    assert.match(sort.headers.get('set-cookie'), /^lk_upl_sort=2;/);
    const theme = await fetch(origin + '/lk/profile?type=Personalization', {
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
    for (const route of ['/comments', '/comments.php']) {
      const fragment = await fetch(origin + route + '?ajax=1&before=9');
      assert.equal(fragment.status, 200);
      assert.equal(fragment.headers.get('cache-control'), 'no-store');
      const html = await fragment.text();
      assert.ok(html.includes('data-comment-id="8"'));
      assert.ok(!html.includes('<html'));
    }
    const admin = await fetch(origin + '/admin?type=News', { redirect: 'manual' });
    assert.equal(admin.status, 307);
    assert.equal(new URL(admin.headers.get('location'), origin).pathname, '/login');
    const nonAdmin = await fetch(origin + '/admin?type=News', { headers: { cookie: 'test-viewer=1' } });
    assert.equal(nonAdmin.status, 403);
    const moderator = await fetch(origin + '/admin?type=News', { headers: { cookie: 'test-admin=2' }, redirect: 'manual' });
    assert.equal(moderator.status, 307);
    assert.equal(moderator.headers.get('location'), '/admin?type=Photo');
    const newsAdmin = await fetch(origin + '/admin?type=News', { headers: { cookie: 'test-admin=1' } });
    assert.equal(newsAdmin.status, 200);
    assert.ok((await newsAdmin.text()).includes('id="create-news"'));
    const robots = await fetch(origin + '/robots.txt');
    assert.equal(robots.status, 200);
    assert.equal(robots.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.ok((await robots.text()).includes('Disallow: /lk/'));
    const logout = await fetch(origin + '/logout', { headers: { cookie: 'test-viewer=1' }, redirect: 'manual' });
    assert.equal(logout.status, 302);
    assert.equal(logout.headers.get('location'), '/');
    assert.deepEqual(logout.headers.getSetCookie(), ['NGALLERYSESS=; Max-Age=0; Path=/', 'NGALLERYID=; Max-Age=0; Path=/']);
    const guestEntry = await fetch(origin + '/voting/sendpretend', { redirect: 'manual' });
    assert.equal(guestEntry.status, 307);
    assert.equal(guestEntry.headers.get('location'), '/login');
    const memberEntry = await fetch(origin + '/voting/sendpretend', { headers: { cookie: 'test-viewer=1' } });
    assert.equal(memberEntry.status, 200);
    assert.match(await memberEntry.text(), /Приём заявок сейчас закрыт/);
    const guestSearch = await fetch(origin + '/search.php?id=9', { redirect: 'manual' });
    assert.equal(guestSearch.status, 307);
    assert.equal(guestSearch.headers.get('location'), '/login');
    for (const route of ['/search', '/search.php']) {
      const search = await fetch(origin + route + '?id=9&page=2', { headers: { cookie: 'test-viewer=1' } });
      assert.equal(search.status, 200);
      assert.match(await search.text(), /Найдено изображений: <b>60<\/b>/);
    }
    const guestMap = await fetch(origin + '/mapmedia', { redirect: 'manual' });
    assert.equal(guestMap.status, 307);
    assert.equal(guestMap.headers.get('location'), '/login');
    const map = await fetch(origin + '/mapmedia', { headers: { cookie: 'test-viewer=1' } });
    assert.equal(map.status, 200);
    const mapHtml = await map.text();
    assert.ok(mapHtml.includes('id="mapd"'));
    assert.ok(mapHtml.includes('leaflet@1.7.1/dist/leaflet.css'));
    assert.doesNotMatch(mapHtml, /src="\/frontend-scripts\/MapMedia\.js"/);
    const photo = await fetch(origin + '/photo/3?aid=9');
    assert.equal(photo.status, 200);
    const photoHtml = await photo.text();
    assert.match(photoHtml, /Место съёмки/);
    assert.ok(photoHtml.includes('/photo/2/?aid=9'));
    assert.match(photoHtml, /id="navbard" style="display:none"|style="display:none" id="navbard"/);
    assert.doesNotMatch(photoHtml, /src="\/frontend-scripts\/(PhotoActions|CommentEmoji)\.js"/);
    assert.equal((await fetch(origin + '/photo/999')).status, 404);
    const tour = await fetch(origin + '/tour');
    const tourHtml = await tour.text();
    assert.doesNotMatch(tourHtml, /src="\/frontend-scripts\/TourLogin\.js"/);
    assert.match(tourHtml, /id="start" class="tabcontent" style="display:block"/);
    assert.equal((tourHtml.match(/id="backgr"/g) ?? []).length, 1);
    for (const [route, button] of [['/register', 'regbtn'], ['/login', 'loginbtn']]) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(html.includes(`id="${button}"`));
      assert.doesNotMatch(html, /src="\/frontend-scripts\/(Register|Login)\.js"/);
    }
  } finally {
    next.kill();
    api.close();
  }
});
