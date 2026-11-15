import { apiFetch } from '../../api/client';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader, SectionTabs } from './PageHeader';
import { ModerationQueue } from './photos/ModerationQueue';
import { PhotoArchive } from './photos/PhotoArchive';
import type { PendingPhoto } from './photos/decisions';
import { Pagination } from './ui/pagination';
import { SearchForm } from './ui/search-form';
import { plural } from './lib/format';

const tabs = { moderate: 'На модерации', published: 'Опубликованные', declined: 'Отклонённые' } as const;
type Tab = keyof typeof tabs;

export function AdminPhotos(query: URLSearchParams) {
  const tab: Tab = query.get('tab') === 'published' || query.get('tab') === 'declined' ? query.get('tab') as Tab : 'moderate';
  const page = /^\d{1,5}$/.test(query.get('page') ?? '') ? Math.max(1, Number(query.get('page'))) : 1;
  const search = (query.get('q') ?? '').trim().slice(0, 100);
  const link = (target: Tab, params: Record<string, string> = {}) =>
    '/admin?' + new URLSearchParams({ type: 'Photo', ...(target === 'moderate' ? {} : { tab: target }), ...params });

  return AdminPage('moderator', async () => {
    const [queue, galleries] = await Promise.all([
      adminData<PendingPhoto[]>('/api/admin/images/pending'),
      apiFetch('/api/internal/galleries').then(response => response?.ok ? response.json() as Promise<{ id: number; title: string }[]> : []).catch(() => []),
    ]);
    const names = Object.fromEntries(galleries.map(gallery => [gallery.id, gallery.title]));
    let body;
    if (tab === 'moderate') body = <ModerationQueue photos={queue} galleries={names} />;
    else {
      const status = tab === 'published' ? 1 : 2;
      const list = await adminData<{ total: number; page: number; pages: number; photos: PendingPhoto[] }>(
        '/api/admin/images?' + new URLSearchParams({ status: String(status), page: String(page), q: search }));
      body = <>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchForm hidden={{ type: 'Photo', tab }} value={search} placeholder="Номер, место или описание" className="sm:w-80" />
          <p className="text-[13px] text-muted-foreground">{search ? 'Найдено: ' : 'Всего: '}{plural(list.total, 'фотография', 'фотографии', 'фотографий')}</p>
        </div>
        <PhotoArchive photos={list.photos} status={status} query={search} />
        <Pagination page={list.page} pages={list.pages} href={target => link(tab, { ...(search ? { q: search } : {}), page: String(target) })} />
      </>;
    }
    return <>
      <PageHeader title="Фотографии" description="Решения по новым загрузкам и пересмотр уже принятых." />
      <SectionTabs tabs={(Object.keys(tabs) as Tab[]).map(key => ({
        href: link(key), label: tabs[key], active: key === tab, count: key === 'moderate' ? queue.length : undefined,
      }))} />
      {body}
    </>;
  });
}
