import { AdminModelCreate } from '../../features/admin/AdminModelCreate';
import { AdminEntities } from '../../features/admin/AdminEntities';
import { AdminContests } from '../../features/admin/AdminContests';
import { AdminSettings } from '../../features/admin/AdminSettings';
import { AdminUsers } from '../../features/admin/AdminUsers';
import { AdminPhotos } from '../../features/admin/AdminPhotos';
import { AdminGeo } from '../../features/admin/AdminGeo';
import { AdminModels } from '../../features/admin/AdminModels';
import { AdminGalleries } from '../../features/admin/AdminGalleries';
import { AdminPages } from '../../features/admin/AdminPages';
import { AdminNews } from '../../features/admin/AdminNews';
import { NotFound } from '../../features/site/StaticPages';

export async function GET(request: Request) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const query = new URL(request.url).searchParams;
  const section = query.get('type');
  if (section === 'Galleries') return AdminGalleries(request, api);
  if (section === 'Pages' || section === 'PageCreate') return AdminPages(request, api, section === 'PageCreate');
  if (section === 'News') return AdminNews(request, api);
  if (section === 'EntityEdit') return AdminModelCreate(request, api, query.get('id') ?? '');
  if (section === 'ModelsCreate') return AdminModelCreate(request, api);
  if (section === 'Entities' || section === 'EntityCreate') return AdminEntities(request, api, section === 'EntityCreate');
  if (!section || section === 'General') return AdminUsers(request, api);
  if (section === 'UserEdit') return AdminUsers(request, api, query.get('user_id') ?? '');
  if (section === 'Contests') return AdminContests(request, api);
  if (section === 'Settings') return AdminSettings(request, api);
  if (section === 'Photo') return AdminPhotos(request, api);
  if (section === 'GeoDB') return AdminGeo(request, api);
  if (section === 'Models') return AdminModels(request, api);
  return NotFound(request);
}
