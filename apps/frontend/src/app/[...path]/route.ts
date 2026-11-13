import { Document, type PageContext } from '../../components/Document';
import { AdminModelCreate } from '../../features/admin/AdminModelCreate';
import { AdminEntities } from '../../features/admin/AdminEntities';
import { ContestEntries } from '../../features/contests/ContestEntries';
import { ContestVoting } from '../../features/contests/ContestVoting';
import { ContestResults } from '../../features/contests/ContestResults';
import { AdminContests } from '../../features/admin/AdminContests';
import { AdminSettings } from '../../features/admin/AdminSettings';
import { AdminUsers } from '../../features/admin/AdminUsers';
import { AdminPhotos } from '../../features/admin/AdminPhotos';
import { AdminGeo } from '../../features/admin/AdminGeo';
import { AdminModels } from '../../features/admin/AdminModels';
import { AdminGalleries } from '../../features/admin/AdminGalleries';
import { AdminPages } from '../../features/admin/AdminPages';
import { AdminNews } from '../../features/admin/AdminNews';
import { NotFound, Tour } from '../../features/site/StaticPages';
import { ProfileSettings } from '../../features/site/ProfileSettings';
import { NewsPage } from '../../features/site/NewsPage';
import { SitePage } from '../../features/site/SitePage';
import { Account } from '../../features/site/Account';
import { AuthorSearch } from '../../features/site/AuthorSearch';
import { Author } from '../../features/site/Author';
import { FavoritePhotos } from '../../features/photos/FavoritePhotos';
import { FollowedPhotos } from '../../features/photos/FollowedPhotos';
import { VehicleRequest } from '../../features/photos/VehicleRequest';
import { VehicleEdit } from '../../features/photos/VehicleEdit';
import { VehiclePage } from '../../features/photos/VehiclePage';
import { UploadPage } from '../../features/photos/upload/UploadPage';
import { CommentFeed } from '../../features/photos/CommentFeed';
import { UpdatesPage } from '../../features/photos/UpdatesPage';
import { MapMedia } from '../../features/photos/MapMedia';
import { FeedPage } from '../../features/photos/FeedPage';
import { GalleryDirectory } from '../../features/photos/GalleryDirectory';
import { GalleryPage } from '../../features/photos/GalleryPage';
import { PhotoSearch } from '../../features/photos/PhotoSearch';
import { PhotoDetails } from '../../features/photos/PhotoDetails';
import { TopPhotos } from '../../features/photos/TopPhotos';

const legacyPaths: ReadonlyMap<string, string> = new Map([
  ['comments.php', 'comments'],
  ['update.php', 'update'],
  ['search.php', 'search'],
  ['voting.php', 'voting'],
]);

export const dynamic = 'force-dynamic';

export async function GET(request: Request, route: { params: Promise<{ path?: string[] }> }) {
  const requestedPath = (await route.params).path?.join('/') ?? '';
  const path = legacyPaths.get(requestedPath) ?? requestedPath;
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  if (path === 'admin') {
    const section = new URL(request.url).searchParams.get('type');
    if (section === 'Galleries') return AdminGalleries(request, api);
    if (section === 'Pages' || section === 'PageCreate') return AdminPages(request, api, section === 'PageCreate');
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
  const sitePageId = path.match(/^page\/(\d+)$/)?.[1];
  const galleryId = path.match(/^article\/(\d+)$/)?.[1];
  const vehicleId = path.match(/^vehicle\/(\d+)$/)?.[1];
  const authorId = path.match(/^author\/(\d+)$/)?.[1];
  const followed = path === 'lk' || path === 'lk/pday' || path === 'lk/history'
    ? await Account(request, api, path === 'lk/history' ? 'uploads' : path === 'lk/pday' ? 'upload-index' : '')
    : path === 'lk/upload' ? await UploadPage(request, api)
    : path === 'lk/profile' ? await ProfileSettings(request, api)
    : path === 'comments' ? await CommentFeed(request, api)
    : path === 'update' ? await UpdatesPage(api)
    : path === 'mapmedia' ? await MapMedia(request, api)
    : path === 'feed' ? await FeedPage(api)
    : sitePageId ? await SitePage(request, api, sitePageId)
    : path === 'news2.php' ? await NewsPage(api)
    : path === 'misc' ? await GalleryDirectory(api)
    : galleryId ? await GalleryPage(request, api, galleryId)
    : path === 'authors.php' ? await AuthorSearch(request, api)
    : path === 'search' ? await PhotoSearch(request, api)
    : authorId ? await Author(request, api, authorId) : path === 'voting/waiting' || path === 'voting/sendpretend'
    ? await ContestEntries(request, api, path === 'voting/sendpretend')
    : path === 'voting' ? await ContestVoting(request, api)
    : path === 'voting/results' ? await ContestResults(api)
    : path === 'vehicle/dbedit' ? await VehicleRequest(request, api)
    : path === 'vehicle/edit' ? await VehicleEdit(request, api)
    : vehicleId ? await VehiclePage(request, api, vehicleId)
    : path === 'fav_authors' ? await FollowedPhotos(request, api)
    : path === 'fav' ? await FavoritePhotos(request, api) : undefined;
  if (followed instanceof Response) return followed;
  const markup = followed ?? ( path === 'top30' ? await TopPhotos(api) : path === 'photoext' ? await PhotoDetails(request, api) : path === 'tour' ? Tour() : undefined);
  if (!markup) return path === 'top30' || path === 'photoext' ? new Response('Service Unavailable', { status: 503 }) : NotFound(request);
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const context: PageContext = await response.json();
  return Document(request, markup, context);
}

export async function POST(request: Request, route: { params: Promise<{ path?: string[] }> }) {
  const path = (await route.params).path?.join('/');
  const url = new URL(request.url);
  if (path !== 'lk/profile' || url.searchParams.get('type') !== 'Personalization') return NotFound(request);
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const viewer = await fetch(api + '/api/profile/settings', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (viewer?.status === 403) return Response.redirect(new URL('/login', url), 303);
  if (!viewer?.ok) return new Response('Service Unavailable', { status: 503 });
  const form = await request.formData().catch(() => null);
  const theme = form?.get('theme_id');
  if (theme !== 'standard' && theme !== 'nativegallery-dark') return new Response(null, { status: 400 });
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  return new Response(null, { status: 303, headers: {
    Location: '/lk/profile?type=Personalization',
    'Set-Cookie': 'NGALLERYTHEME=' + theme + '; Path=/; HttpOnly; SameSite=Lax' + secure,
    'Cache-Control': 'private, no-store',
  } });
}
