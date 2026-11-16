import { GeoKind } from '@nativegallery/contracts';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { CreateNews, NewsList, type NewsCity, type NewsItem } from './news/NewsList';

export function AdminNews() {
  return AdminPage('editor', async () => {
    const [items, geo] = await Promise.all([
      adminData<NewsItem[]>('/api/admin/news'),
      adminData<{ id: number; title: string; kind: number }[]>('/api/admin/geodb'),
    ]);
    const collator = new Intl.Collator('ru');
    const cities: NewsCity[] = geo.filter(entry => entry.kind === GeoKind.City)
      .map(({ id, title }) => ({ id, title })).sort((a, b) => collator.compare(a.title, b.title));
    return <>
      <PageHeader title="Новости" description="Новости сайта и новости транспорта по городам: обе ленты выводятся на главной." actions={<CreateNews cities={cities} />} />
      <NewsList items={items} cities={cities} />
    </>;
  });
}
