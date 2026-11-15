'use client';

import { ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';
import Link from '../../../components/Link';
import { formatDate } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';

export interface PageSummary { id: number; title: string; created_at: number }

export function PagesList({ pages, create }: { pages: PageSummary[]; create: React.ReactNode }) {
  const [pending, run] = useAction();
  if (!pages.length) return <Card><Empty icon={FileText} title="Страниц пока нет" action={create}>Правила, справка и другие статичные тексты сайта.</Empty></Card>;
  return <Card><ul className="divide-y">{pages.map(page => <li key={page.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
    <div className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground"><FileText className="size-4" /></div>
    <div className="min-w-0 flex-1">
      <Link href={'/admin?type=PageEdit&id=' + page.id} className="block truncate font-medium hover:underline">{page.title}</Link>
      <p className="text-[13px] text-muted-foreground">/page/{page.id}, создана {formatDate(page.created_at, { time: false })}</p>
    </div>
    <div className="flex gap-1">
      <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=PageEdit&id=' + page.id} aria-label="Редактировать"><Pencil /></Link></Button>
      <Button size="icon-sm" variant="ghost" asChild><a href={'/page/' + page.id} target="_blank" rel="noreferrer" aria-label="Открыть на сайте"><ExternalLink /></a></Button>
      <Confirm title={'Удалить страницу «' + page.title + '»?'} description="Ссылки на неё перестанут работать. Это действие нельзя отменить."
        onConfirm={() => run(() => send('/api/admin/pages/' + page.id, { method: 'DELETE', fallback: 'Не удалось удалить страницу.' }), { success: 'Страница удалена' })}
        trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending} aria-label="Удалить"><Trash2 /></Button>} />
    </div>
  </li>)}</ul></Card>;
}
