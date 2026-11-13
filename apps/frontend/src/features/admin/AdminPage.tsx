import type { ReactNode } from 'react';
import { renderToStaticMarkup } from '../../components/RenderMarkup';
import type { Viewer } from '@nativegallery/contracts';
import { AdminSidebar } from './AdminSidebar';
import { escapeHtml } from '../../components/Html';

const head = (title: string, script: string | null) => '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>' + escapeHtml(title) + '</title><link rel="stylesheet" href="https://rsms.me/inter/inter.css">' +
  '<link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">' +
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css">' +
  '<link rel="stylesheet" href="/static/css/header.admin.css"><link rel="stylesheet" href="/static/css/tabs.css">' +
  '<style>body{font-family:Inter!important}</style>' +
  '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" defer></script>' +
  '<script src="/frontend-scripts/AdminSidebar.js" defer></script>' +
  (script ? '<script src="/frontend-scripts/' + script + '.js" defer></script>' : '');

export async function AdminPage(request: Request, api: string, title: string, script: 'AdminNews' | 'AdminModels' | 'AdminModelCreate' | 'AdminEntities' | 'AdminGeo' | 'AdminPhotos' | 'AdminUsers' | 'AdminSettings' | 'AdminContests' | 'AdminPages' | null,
  load: (options: RequestInit) => Promise<ReactNode | Response>) {
  const options = { headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store' as const };
  const viewerResponse = await fetch(api + '/api/internal/viewer', options).catch(() => null);
  if (!viewerResponse?.ok) return new Response('Service Unavailable', { status: 503 });
  const { viewer }: { viewer: Viewer | null } = await viewerResponse.json();
  if (!viewer) return Response.redirect(new URL('/login', request.url), 302);
  if (viewer.admin === 2 && script !== 'AdminPhotos') return Response.redirect(new URL('/admin?type=Photo', request.url), 302);
  if (!viewer.admin) return new Response('Forbidden', { status: 403 });
  const content = await load(options);
  if (content instanceof Response) return content;
  if (!content) return new Response('Service Unavailable', { status: 503 });
  const body = renderToStaticMarkup(<div className="container">
    <AdminSidebar title={process.env.SITE_TITLE ?? 'NativeGallery'} pending={viewer.pendingPhotos} />
    {content}
  </div>);
  return new Response('<!DOCTYPE html><html lang="ru"><head>' + head(title, script) + '</head><body>' + body + '</body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
