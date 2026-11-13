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
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(await searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(name, first);
  }
  const section = query.get('type');
  if (section === 'Galleries') return AdminGalleries(api);
  if (section === 'Pages' || section === 'PageCreate') return AdminPages(api, section === 'PageCreate');
  if (section === 'News') return AdminNews(api);
  if (section === 'EntityEdit') return AdminModelCreate(api, query.get('id') ?? '');
  if (section === 'ModelsCreate') return AdminModelCreate(api);
  if (section === 'Entities' || section === 'EntityCreate') return AdminEntities(api, section === 'EntityCreate');
  if (!section || section === 'General' || section === 'UserEdit') {
    const requestHeaders = await headers();
    const host = requestHeaders.get('host');
    const scheme = requestHeaders.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const origin = process.env.SITE_ORIGIN || (host ? scheme + '://' + host : '');
    return AdminUsers(api, origin, section === 'UserEdit' ? query.get('user_id') ?? '' : undefined);
  }
  if (section === 'Contests') return AdminContests(api, query);
  if (section === 'Settings') return AdminSettings(api);
  if (section === 'Photo') return AdminPhotos(api);
  if (section === 'GeoDB') return AdminGeo(api);
  if (section === 'Models') return AdminModels(api, query);
  notFound();
}
