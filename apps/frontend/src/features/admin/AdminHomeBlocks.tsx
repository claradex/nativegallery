import type { HomeBlockSettings } from '@nativegallery/contracts';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { HomeBlocksEditor } from './home/HomeBlocksEditor';

export function AdminHomeBlocks() {
  return AdminPage('owner', async () => {
    const blocks = await adminData<HomeBlockSettings[]>('/api/admin/home-blocks');
    return <>
      <PageHeader title="Главная страница"
        description="Какие блоки видят посетители: все, только вошедшие на сайт или никто. Порядок задаётся внутри колонки." />
      <HomeBlocksEditor blocks={blocks} />
    </>;
  });
}
