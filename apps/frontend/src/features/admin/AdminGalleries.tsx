import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { GalleryList, type Gallery } from './galleries/GalleryList';

export function AdminGalleries() {
  return AdminPage('owner', async () => {
    const galleries = await adminData<Gallery[]>('/api/admin/galleries');
    return <>
      <PageHeader title="Галереи" description="Тематические подборки, в которые авторы кладут фотографии при загрузке." />
      <GalleryList galleries={galleries} />
    </>;
  });
}
