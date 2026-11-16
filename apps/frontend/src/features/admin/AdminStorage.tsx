import { CheckCircle2, CircleAlert } from 'lucide-react';
import { notFound } from 'next/navigation';
import { replicaStatusLabels, type ReplicaStatus, type StorageOverview, type StorageReplicaPage } from '@nativegallery/contracts';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader, SectionTabs } from './PageHeader';
import { Pagination } from './ui/pagination';
import { SearchForm } from './ui/search-form';
import { StorageEditor } from './storage/StorageEditor';
import { StorageList } from './storage/StorageList';
import { ReplicaTable } from './storage/ReplicaTable';

const filters = ['problems', 'pending', 'published', 'all'] as const;
type Filter = typeof filters[number];
const filterLabels: Record<Filter, string> = { problems: 'Проблемы', pending: replicaStatusLabels.pending, published: 'Опубликованные', all: 'Все файлы' };

/** The outcome of «Войти через Google», which returns here. */
function GoogleOutcome({ query }: { query: URLSearchParams }) {
  const outcome = query.get('google');
  if (outcome === 'connected') {
    return <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-success/10 px-3 py-2.5 text-sm text-success">
      <CheckCircle2 className="size-4 shrink-0" />Аккаунт Google подключён{query.get('title') ? ' к хранилищу «' + query.get('title') + '»' : ''}. Публикация начнётся в фоне.
    </p>;
  }
  if (outcome === 'error') {
    return <p role="alert" className="mb-4 flex items-start gap-2 rounded-md bg-destructive/8 px-3 py-2.5 text-sm break-words text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />Не удалось подключить Google: {query.get('message') || 'неизвестная ошибка'}
    </p>;
  }
  return null;
}

/** «Хранилища»: the external storages with their totals, or (`id`) the files of one storage by state. */
export function AdminStorage(query: URLSearchParams) {
  return AdminPage('owner', async () => {
    const overview = await adminData<StorageOverview>('/api/admin/storage');
    const id = query.get('id');
    if (!id) {
      return <>
        <PageHeader title="Хранилища"
          description="Копии фотографий и видео во внешних хранилищах: на другом диске, в Google Drive, S3 или WebDAV. Файлы публикуются в фоне после загрузки и регулярно сверяются с оригиналами."
          actions={<StorageEditor redirectUri={overview.googleRedirectUri} googleDevice={overview.googleDevice} />} />
        <GoogleOutcome query={query} />
        <StorageList overview={overview} />
      </>;
    }
    const target = overview.targets.find(item => String(item.id) === id);
    if (!target) notFound();
    const filter: Filter = filters.find(item => item === query.get('status')) ?? 'problems';
    const search = (query.get('q') ?? '').trim();
    const photo = /^\d{1,10}$/.test(search) ? search : '';
    const page = query.get('page') ?? '1';
    const list = await adminData<StorageReplicaPage>('/api/admin/storage/' + target.id + '/replicas?' +
      new URLSearchParams({ status: filter, page, ...(photo ? { photo } : {}) }));
    const link = (status: Filter, extra: Record<string, string> = {}) => '/admin?' + new URLSearchParams({ type: 'Storage', id: String(target.id), status, ...extra });
    const problems = target.files.failed + target.files.missing + target.files.mismatch;
    const counts: Record<Filter, number> = {
      problems, pending: target.files.pending, published: target.files.published,
      all: Object.values(target.files).reduce((sum, count) => sum + count, 0),
    };
    return <>
      <PageHeader title={target.title} back={{ href: '/admin?type=Storage', label: 'Все хранилища' }}
        description="Файлы фотографий в этом хранилище и результат последней проверки каждого из них." />
      <SectionTabs tabs={filters.map(item => ({ href: link(item), label: filterLabels[item], active: item === filter, count: item === 'problems' ? counts[item] : undefined }))} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{list.total.toLocaleString('ru-RU')} из {counts[filter].toLocaleString('ru-RU')}{photo ? ' — фото №' + photo : ''}</p>
        <SearchForm hidden={{ type: 'Storage', id: String(target.id), status: filter }} value={search} placeholder="Номер фотографии" className="sm:w-64" />
      </div>
      <ReplicaTable targetId={target.id} enabled={target.enabled} replicas={list.replicas} filter={filter as ReplicaStatus | 'problems' | 'all'} />
      <Pagination page={list.page} pages={list.pages} href={number => link(filter, { ...(photo ? { q: photo } : {}), page: String(number) })} />
    </>;
  });
}
