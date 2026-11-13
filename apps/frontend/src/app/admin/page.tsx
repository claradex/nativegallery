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
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(await searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(name, first);
  }
  const section = query.get('type');
  if (section === 'Galleries') return AdminGalleries();
  if (section === 'Pages' || section === 'PageCreate') return AdminPages(section === 'PageCreate');
  if (section === 'News') return AdminNews();
  if (section === 'EntityEdit') return AdminModelCreate(query.get('id') ?? '');
  if (section === 'ModelsCreate') return AdminModelCreate();
  if (section === 'Entities' || section === 'EntityCreate') return AdminEntities(section === 'EntityCreate');
  if (!section || section === 'General' || section === 'UserEdit') {
    const requestHeaders = await headers();
    const host = requestHeaders.get('host');
    const scheme = requestHeaders.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const origin = process.env.SITE_ORIGIN || (host ? scheme + '://' + host : '');
    return AdminUsers(origin, section === 'UserEdit' ? query.get('user_id') ?? '' : undefined);
  }
  if (section === 'Contests') return AdminContests(query);
  if (section === 'Settings') return AdminSettings();
  if (section === 'Photo') return AdminPhotos();
  if (section === 'GeoDB') return AdminGeo();
  if (section === 'Models') return AdminModels(query);
  notFound();
}
