import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { GeoList, type GeoEntry } from './geo/GeoList';

export function AdminGeo() {
  return AdminPage('editor', async () => {
    const entries = await adminData<GeoEntry[]>('/api/admin/geodb');
    return <>
      <PageHeader title="GeoDB" description="Справочник мест, который предлагается авторам при загрузке фотографий." />
      <GeoList entries={entries} />
    </>;
  });
}
