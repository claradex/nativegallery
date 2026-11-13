import { Document, type PageContext } from '../../components/Document';
import { AdminModelCreate } from '../../features/admin/AdminModelCreate';
import { AdminEntities } from '../../features/admin/AdminEntities';
import { AdminContests } from '../../features/admin/AdminContests';
import { AdminSettings } from '../../features/admin/AdminSettings';
import { AdminUsers } from '../../features/admin/AdminUsers';
import { AdminPhotos } from '../../features/admin/AdminPhotos';
import { AdminGeo } from '../../features/admin/AdminGeo';
import { AdminModels } from '../../features/admin/AdminModels';
import { AdminNews } from '../../features/admin/AdminNews';
import { Login } from '../../features/auth/Login';
import { Home } from '../../features/home/Home';
import { NotFound, Tour } from '../../features/site/StaticPages';
import { About } from '../../features/site/About';
import { FavoritePhotos } from '../../features/photos/FavoritePhotos';
import { FollowedPhotos } from '../../features/photos/FollowedPhotos';
import { VehicleRequest } from '../../features/photos/VehicleRequest';
import { VehicleEdit } from '../../features/photos/VehicleEdit';
import { VehiclePage } from '../../features/photos/VehiclePage';
import { PhotoPage } from '../../features/photos/PhotoPage';
import { PhotoDetails } from '../../features/photos/PhotoDetails';
import { TopPhotos } from '../../features/photos/TopPhotos';
import { Rules } from '../../features/rules/Rules';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, route: { params: Promise<{ path?: string[] }> }) {
  const path = (await route.params).path?.join('/') ?? '';
  const login = path === 'login';
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  if (path === 'admin') {
    const section = new URL(request.url).searchParams.get('type');
    if (section === 'News') return AdminNews(request, api);
    if (section === 'EntityEdit') return AdminModelCreate(request, api, new URL(request.url).searchParams.get('id') ?? '');
    if (section === 'ModelsCreate') return AdminModelCreate(request, api);
    if (section === 'Entities' || section === 'EntityCreate') return AdminEntities(request, api, section === 'EntityCreate');
    if (!section || section === 'General') return AdminUsers(request, api);
    if (section === 'UserEdit') return AdminUsers(request, api, new URL(request.url).searchParams.get('user_id') ?? '');
    if (section === 'Contests') return AdminContests(request, api);
    if (section === 'Settings') return AdminSettings(request, api);
    if (section === 'Photo') return AdminPhotos(request, api);
    if (section === 'GeoDB') return AdminGeo(request, api);
    if (section === 'Models') return AdminModels(request, api);
  }
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
  const photoId = path.match(/^photo\/(\d+)$/)?.[1];
  const vehicleId = path.match(/^vehicle\/(\d+)$/)?.[1];
  const followed = path === 'vehicle/dbedit' ? await VehicleRequest(request, api)
    : path === 'vehicle/edit' ? await VehicleEdit(request, api)
    : vehicleId ? await VehiclePage(request, api, vehicleId) : photoId ? await PhotoPage(request, api, photoId)
    : path === 'fav_authors' ? await FollowedPhotos(request, api)
    : path === 'fav' ? await FavoritePhotos(request, api) : undefined;
  if (followed instanceof Response) return followed;
  const markup = followed ?? ( login ? Login() : path === '' ? await Home(api) : path === 'about' ? await About(api) : path === 'top30' ? await TopPhotos(api) : path === 'photoext' ? await PhotoDetails(request, api) : path === 'tour' ? Tour() : Rules(path));
  if (!markup) return path === '' || path === 'about' || path === 'top30' || path === 'photoext' ? new Response('Service Unavailable', { status: 503 }) : NotFound(request);
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const context: PageContext = await response.json();
  if (login && context.viewer) return Response.redirect(new URL('/', request.url), 302);
  return Document(request, markup, context);
}
