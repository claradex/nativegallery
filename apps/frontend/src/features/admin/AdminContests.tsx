import { TriangleAlert } from 'lucide-react';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader, SectionTabs } from './PageHeader';
import { ContestsTable, NewContest, NewTheme, ThemesList, type Contest, type Theme } from './contests/ContestsView';

export function AdminContests(query: URLSearchParams) {
  const categories = query.get('tab') === 'categories';
  return AdminPage('editor', async () => {
    const { contests, themes, configured, enabled } =
      await adminData<{ contests: Contest[]; themes: Theme[]; configured?: boolean; enabled: boolean }>('/api/admin/contests');
    return <>
      <PageHeader title="Фотоконкурсы" description="Тематические конкурсы: отбор кандидатов и голосование за победителей."
        actions={categories ? <NewTheme /> : <NewContest themes={themes} />} />
      <SectionTabs tabs={[
        { href: '/admin?type=Contests', label: 'Конкурсы', active: !categories, count: contests.filter(contest => contest.status === 1 || contest.status === 2).length },
        { href: '/admin?type=Contests&tab=categories', label: 'Категории', active: categories },
      ]} />
      {!enabled && !categories && <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-warning-foreground/20 bg-warning px-4 py-3 text-sm text-warning-foreground">
        <TriangleAlert className="size-4 shrink-0" />
        {configured === false
          ? <p className="flex-1">Конкурсы отключены в настройках сервера (переменная <code className="font-mono text-[13px]">CONTESTS_ENABLED</code>): они не будут переходить между этапами.</p>
          : <>
            <p className="flex-1">Фоновая задача проведения конкурсов выключена: конкурсы не будут переходить между этапами.</p>
            <Link href="/admin?type=Settings" className="font-medium underline underline-offset-2">Фоновые задачи</Link>
          </>}
      </div>}
      {categories ? <ThemesList themes={themes} contests={contests} /> : <ContestsTable contests={contests} themes={themes} />}
    </>;
  });
}
