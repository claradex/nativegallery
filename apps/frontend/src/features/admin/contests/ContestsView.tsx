'use client';

import { CalendarRange, Pencil, Plus, Tags, Trash2, Trophy } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { formatPeriod } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Confirm } from '../ui/confirm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Empty } from '../ui/empty';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, NativeSelect } from '../ui/input';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface Theme { id: number; title: string; status: number }
export interface Contest { id: number; themeid: number; openpretendsdate: number; closepretendsdate: number; opendate: number; closedate: number; status: number }

const statuses: { label: string; variant: 'secondary' | 'info' | 'warning' | 'success' }[] = [
  { label: 'Запланирован', variant: 'secondary' }, { label: 'Отбор кандидатов', variant: 'info' },
  { label: 'Голосование', variant: 'warning' }, { label: 'Завершён', variant: 'success' },
];

function StatusBadge({ status }: { status: number }) {
  const meta = statuses[status];
  return meta ? <Badge variant={meta.variant}>{meta.label}</Badge> : <Badge variant="destructive">Сбой</Badge>;
}

/** datetime-local value in Moscow time, which the API assumes for values without an offset. */
function moscowInput(date: Date) {
  return new Date(date.getTime() + 3 * 3600_000).toISOString().slice(0, 16);
}

function ContestDialog({ themes, trigger }: { themes: Theme[]; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const day = 86_400_000;
  const initial = () => {
    const now = Date.now();
    return { themeid: String(themes[0]?.id ?? ''), openpretendsdate: moscowInput(new Date(now + day)), closepretendsdate: moscowInput(new Date(now + 8 * day)),
      opendate: moscowInput(new Date(now + 8 * day)), closedate: moscowInput(new Date(now + 15 * day)), startContestNow: true };
  };
  const [form, setForm] = useState(initial);
  const [pending, run] = useAction();
  const set = (key: keyof ReturnType<typeof initial>) => (event: { target: { value: string } }) => setForm(value => ({ ...value, [key]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { startContestNow, opendate, ...rest } = form;
    const result = await run(() => send('/api/admin/contests/create', {
      body: { ...rest, ...(startContestNow ? { startContestNow: '1' } : { opendate }) },
      fallback: 'Не удалось создать конкурс. Даты должны идти по порядку: отбор, затем голосование.',
    }), { success: 'Конкурс запланирован' });
    if (result.ok) setOpen(false);
  }

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) setForm(initial()); }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader>
          <DialogTitle>Новый фотоконкурс</DialogTitle>
          <DialogDescription>Время московское. Сначала идёт отбор кандидатов, затем голосование.</DialogDescription>
        </DialogHeader>
        <Field><Label htmlFor="contest-theme">Категория</Label>
          <NativeSelect id="contest-theme" value={form.themeid} onChange={set('themeid')} required>
            {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.title}</option>)}
          </NativeSelect></Field>
        <fieldset className="grid gap-3 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Отбор кандидатов</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field><Label htmlFor="c-op">Начало</Label><Input id="c-op" type="datetime-local" value={form.openpretendsdate} onChange={set('openpretendsdate')} required /></Field>
            <Field><Label htmlFor="c-cp">Конец</Label><Input id="c-cp" type="datetime-local" value={form.closepretendsdate} onChange={set('closepretendsdate')} required /></Field>
          </div>
        </fieldset>
        <fieldset className="grid gap-3 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Голосование</legend>
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox checked={form.startContestNow} onCheckedChange={value => setForm(current => ({ ...current, startContestNow: value === true }))} />
            Начать сразу после отбора
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field><Label htmlFor="c-o">Начало</Label>
              <Input id="c-o" type="datetime-local" value={form.startContestNow ? form.closepretendsdate : form.opendate} onChange={set('opendate')} disabled={form.startContestNow} required /></Field>
            <Field><Label htmlFor="c-c">Конец</Label><Input id="c-c" type="datetime-local" value={form.closedate} onChange={set('closedate')} required /></Field>
          </div>
        </fieldset>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="submit" disabled={pending || !themes.length}>Запланировать</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function ThemeDialog({ theme, trigger }: { theme?: Theme; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(theme?.title ?? '');
  const [active, setActive] = useState(theme ? theme.status === 1 : true);
  const [pending, run] = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = { body: title, active: active ? '1' : undefined };
    const result = await run(() => theme
      ? send('/api/admin/contests/themes/' + theme.id, { method: 'PATCH', body, fallback: 'Не удалось сохранить категорию.' })
      : send('/api/admin/contests/createtheme', { body, fallback: 'Не удалось создать категорию.' }),
    { success: theme ? 'Категория сохранена' : 'Категория добавлена' });
    if (result.ok) setOpen(false);
  }

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setTitle(theme?.title ?? ''); setActive(theme ? theme.status === 1 : true); } }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader><DialogTitle>{theme ? 'Категория конкурса' : 'Новая категория'}</DialogTitle>
          <DialogDescription>Тема, на которую авторы присылают фотографии.</DialogDescription></DialogHeader>
        <Field><Label htmlFor="theme-title">Название</Label>
          <Input id="theme-title" value={title} onChange={event => setTitle(event.target.value)} required /></Field>
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-medium">В автоматическом отборе</p>
            <FieldDescription>Фоновая задача сама проводит конкурсы по таким категориям.</FieldDescription></div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="В автоматическом отборе" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="submit" disabled={pending || !title.trim()}>{theme ? 'Сохранить' : 'Добавить'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

export function NewContest({ themes }: { themes: Theme[] }) {
  return <ContestDialog themes={themes} trigger={<Button disabled={!themes.length}><Plus />Конкурс</Button>} />;
}
export function NewTheme() {
  return <ThemeDialog trigger={<Button><Plus />Категория</Button>} />;
}

function Period({ from, to }: { from: number; to: number }) {
  return <span className="tabular-nums">{formatPeriod(from, to)}</span>;
}

export function ContestsTable({ contests, themes }: { contests: Contest[]; themes: Theme[] }) {
  const [pending, run] = useAction();
  const titles = new Map(themes.map(theme => [theme.id, theme.title]));
  if (!contests.length) return <Card><Empty icon={Trophy} title="Конкурсов ещё не было"
    action={themes.length ? <NewContest themes={themes} /> : undefined}>
    {themes.length ? 'Запланируйте первый.' : 'Сначала добавьте категорию на вкладке «Категории».'}</Empty></Card>;
  const cancel = (contest: Contest) => contest.status === 0 && <Confirm title={'Отменить конкурс № ' + contest.id + '?'}
    description="Конкурс ещё не начался, его можно удалить без последствий." action="Отменить конкурс"
    onConfirm={() => run(() => send('/api/admin/contests/' + contest.id, { method: 'DELETE', fallback: 'Не удалось отменить конкурс.' }), { success: 'Конкурс отменён' })}
    trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending} aria-label="Отменить конкурс"><Trash2 /></Button>} />;
  return <Card>
    <Table className="hidden md:table">
      <TableHeader><TableRow className="hover:bg-transparent">
        <TableHead className="w-14">№</TableHead><TableHead>Категория</TableHead><TableHead>Отбор</TableHead><TableHead>Голосование</TableHead><TableHead>Статус</TableHead><TableHead className="w-12" />
      </TableRow></TableHeader>
      <TableBody>{contests.map(contest => <TableRow key={contest.id}>
        <TableCell className="text-muted-foreground tabular-nums">{contest.id}</TableCell>
        <TableCell className="font-medium">{titles.get(contest.themeid) ?? 'Категория ' + contest.themeid}</TableCell>
        <TableCell className="text-[13px]"><Period from={contest.openpretendsdate} to={contest.closepretendsdate} /></TableCell>
        <TableCell className="text-[13px]"><Period from={contest.opendate} to={contest.closedate} /></TableCell>
        <TableCell><StatusBadge status={contest.status} /></TableCell>
        <TableCell>{cancel(contest)}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
    <ul className="divide-y md:hidden">{contests.map(contest => <li key={contest.id} className="grid gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{titles.get(contest.themeid) ?? 'Категория ' + contest.themeid}</p>
        <div className="flex items-center gap-1"><StatusBadge status={contest.status} />{cancel(contest)}</div>
      </div>
      <dl className="grid gap-1 text-[13px]">
        <div className="flex gap-2"><dt className="w-24 shrink-0 text-muted-foreground">Отбор</dt><dd><Period from={contest.openpretendsdate} to={contest.closepretendsdate} /></dd></div>
        <div className="flex gap-2"><dt className="w-24 shrink-0 text-muted-foreground">Голосование</dt><dd><Period from={contest.opendate} to={contest.closedate} /></dd></div>
      </dl>
    </li>)}</ul>
  </Card>;
}

export function ThemesList({ themes, contests }: { themes: Theme[]; contests: Contest[] }) {
  if (!themes.length) return <Card><Empty icon={Tags} title="Категорий пока нет" action={<NewTheme />}>Категория задаёт тему конкурса.</Empty></Card>;
  return <Card><ul className="divide-y">{themes.map(theme => {
    const held = contests.filter(contest => contest.themeid === theme.id).length;
    return <li key={theme.id} className="flex items-center gap-4 px-5 py-3">
      <div className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground"><CalendarRange className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium [overflow-wrap:anywhere]">{theme.title}
          {theme.status === 1 ? <Badge variant="success">Автоотбор</Badge> : <Badge variant="secondary">Вручную</Badge>}</p>
        <p className="text-[13px] text-muted-foreground">№ {theme.id}, конкурсов: {held}</p>
      </div>
      <ThemeDialog theme={theme} trigger={<Button size="icon-sm" variant="ghost" aria-label="Изменить категорию"><Pencil /></Button>} />
    </li>;
  })}</ul></Card>;
}
