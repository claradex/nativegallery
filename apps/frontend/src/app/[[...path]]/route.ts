import { Document, type PageContext } from '../../components/Document';
import { Login } from '../../features/auth/Login';
import { Home } from '../../features/home/Home';
import { NotFound, Tour } from '../../features/site/StaticPages';
import { About } from '../../features/site/About';
import { FavoritePhotos } from '../../features/photos/FavoritePhotos';
import { FollowedPhotos } from '../../features/photos/FollowedPhotos';
import { TopPhotos } from '../../features/photos/TopPhotos';
import { Rules } from '../../features/rules/Rules';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, route: { params: Promise<{ path?: string[] }> }) {
  const path = (await route.params).path?.join('/') ?? '';
  const login = path === 'login';
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  if (path === 'logout') {
    const response = await fetch(api + '/api/internal/logout', {
      headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store', redirect: 'manual',
    }).catch(() => null);
    if (response?.status !== 302) return new Response('Service Unavailable', { status: 503 });
    const headers = new Headers({ Location: '/', 'Cache-Control': 'private, no-store' });
    for (const cookie of response.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
    return new Response(null, { status: 302, headers });
  }
  if (path === 'robots.txt') {
    const hostname = process.env.SITE_ORIGIN ? new URL(process.env.SITE_ORIGIN).hostname : new URL(request.url).hostname;
    return new Response('User-Agent: *\nDisallow: /lk/\nClean-Param: vid&gid&upd /photo/\nHost: https://' + hostname, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const followed = path === 'fav_authors' ? await FollowedPhotos(request, api)
    : path === 'fav' ? await FavoritePhotos(request, api) : undefined;
  if (followed instanceof Response) return followed;
  const markup = followed ?? ( login ? Login() : path === '' ? await Home(api) : path === 'about' ? await About(api) : path === 'top30' ? await TopPhotos(api) : path === 'tour' ? Tour() : Rules(path));
  if (!markup) return path === '' || path === 'about' || path === 'top30' ? new Response('Service Unavailable', { status: 503 }) : NotFound(request);
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const context: PageContext = await response.json();
  if (login && context.viewer) return Response.redirect(new URL('/', request.url), 302);
  return Document(request, markup, context);
}
