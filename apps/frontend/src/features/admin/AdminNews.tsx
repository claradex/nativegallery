import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate, type Viewer } from '@nativegallery/contracts';
import { AdminSidebar } from './AdminSidebar';

interface NewsItem { id: number; body: string; time: number }

function NewsEditor() {
  return <>
    <h1><b>Новости сайта</b></h1>
    <a href="#" data-bs-toggle="modal" data-bs-target="#createNewsModal" className="btn btn-primary">Создать</a>
    <div className="modal fade" id="createNewsModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog"><form className="modal-content" id="create-news" method="post" action="/api/admin/news/create">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel"><b>Создать новость</b></h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div className="modal-body"><div className="mb-3">
          <label htmlFor="body" className="form-label">Содержание</label>
          <textarea className="form-control" id="body" name="body" rows={3} required />
        </div></div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="submit" className="btn btn-primary">Создать</button>
        </div>
      </form></div>
    </div>
  </>;
}

function NewsCards({ items }: { items: NewsItem[] }) {
  return <div id="news">{items.map(item => <div key={item.id} className="card mb-3"><div className="card-body">
    <i>{legacyDate(item.time)}</i><br />
    <span dangerouslySetInnerHTML={{ __html: item.body }} />
    <br /><a className="btn btn-danger mt-3" href="#" data-news-delete={item.id}>Удалить</a>
  </div></div>)}</div>;
}

const head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Новости сайта</title><link rel="stylesheet" href="https://rsms.me/inter/inter.css">' +
  '<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">' +
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css">' +
  '<link rel="stylesheet" href="/static/css/header.admin.css"><link rel="stylesheet" href="/static/css/tabs.css">' +
  '<style>body{font-family:Inter!important}</style>' +
  '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" defer></script>' +
  '<script src="/frontend-scripts/AdminNews.js" defer></script>';

export async function AdminNews(request: Request, api: string) {
  const options = { headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store' as const };
  const viewerResponse = await fetch(api + '/api/internal/viewer', options).catch(() => null);
  if (!viewerResponse?.ok) return new Response('Service Unavailable', { status: 503 });
  const { viewer }: { viewer: Viewer | null } = await viewerResponse.json();
  if (!viewer) return Response.redirect(new URL('/login', request.url), 302);
  if (viewer.admin === 2) return Response.redirect(new URL('/admin?type=Photo', request.url), 302);
  if (!viewer.admin) return new Response('Forbidden', { status: 403 });

  const response = await fetch(api + '/api/admin/news', options).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const items: NewsItem[] = await response.json();
  const body = renderToStaticMarkup(<div className="container">
    <AdminSidebar title={process.env.SITE_TITLE ?? 'NativeGallery'} pending={viewer.pendingPhotos} />
    <NewsEditor /><NewsCards items={items} />
  </div>);
  return new Response('<!DOCTYPE html><html lang="ru"><head>' + head + '</head><body>' + body + '</body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
