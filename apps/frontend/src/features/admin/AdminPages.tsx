import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { PageEditor } from './pages/PageEditor';
import { PagesList, type PageSummary } from './pages/PagesList';
import { Button } from './ui/button';

const back = { href: '/admin?type=Pages', label: 'Все страницы' };

export function AdminPages(mode: 'list' | 'create' | 'edit', id?: string | null) {
  if (mode === 'edit' && !/^\d{1,10}$/.test(id ?? '')) notFound();
  return AdminPage('owner', async () => {
    if (mode === 'create') return <>
      <PageHeader title="Новая страница" back={back} description="Статичный текст с адресом /page/номер." />
      <PageEditor />
    </>;
    if (mode === 'edit') {
      const page = await adminData<{ id: number; title: string; body: string }>('/api/admin/pages/' + id);
      return <>
        <PageHeader title={page.title} back={back} description={<>Адрес на сайте: <a className="text-primary hover:underline" href={'/page/' + page.id} target="_blank" rel="noreferrer">/page/{page.id}</a></>} />
        <PageEditor page={page} />
      </>;
    }
    const pages = await adminData<PageSummary[]>('/api/admin/pages');
    const create = <Button asChild><Link href="/admin?type=PageCreate"><Plus />Страница</Link></Button>;
    return <>
      <PageHeader title="Страницы" description="Правила, справка и другие статичные тексты сайта." actions={create} />
      <PagesList pages={pages} create={create} />
    </>;
  });
}
