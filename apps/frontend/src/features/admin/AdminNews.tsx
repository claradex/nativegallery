import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { CreateNews, NewsList, type NewsItem } from './news/NewsList';

export function AdminNews() {
  return AdminPage('editor', async () => {
    const items = await adminData<NewsItem[]>('/api/admin/news');
    return <>
      <PageHeader title="Новости сайта" description="Объявления, которые видят все посетители на главной." actions={<CreateNews />} />
      <NewsList items={items} />
    </>;
  });
}
