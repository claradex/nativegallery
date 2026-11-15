'use client';

import { Check, Globe, MapPin, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useDeferredValue, useState, type FormEvent } from 'react';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Input } from '../ui/input';

export interface GeoEntry { id: number; title: string }

function GeoRow({ entry }: { entry: GeoEntry }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [pending, run] = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => send('/api/admin/geodb/' + entry.id, { method: 'PATCH', body: { body: title }, fallback: 'Не удалось сохранить запись.' }), { success: 'Запись сохранена' });
    if (result.ok) setEditing(false);
  }

  return <li className="flex items-center gap-3 px-5 py-2.5">
    <span className="w-10 shrink-0 text-[13px] text-muted-foreground tabular-nums">{entry.id}</span>
    {editing ? <form onSubmit={submit} className="flex flex-1 flex-wrap items-center gap-2">
      <Input value={title} onChange={event => setTitle(event.target.value)} required autoFocus aria-label="Название" className="min-w-48 flex-1" />
      <Button type="submit" size="icon-sm" disabled={pending || !title.trim()} aria-label="Сохранить"><Check /></Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={() => { setEditing(false); setTitle(entry.title); }} aria-label="Отмена"><X /></Button>
    </form> : <>
      <p className="min-w-0 flex-1 truncate text-sm">{entry.title}</p>
      <div className="flex gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label={'Изменить «' + entry.title + '»'}><Pencil /></Button>
        <Confirm title={'Удалить «' + entry.title + '»?'} description="Запись пропадёт из подсказок при загрузке фотографий."
          onConfirm={() => run(() => send('/api/admin/geodb/delete?' + new URLSearchParams({ id: String(entry.id) }), { fallback: 'Не удалось удалить запись.' }), { success: 'Запись удалена' })}
          trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending} aria-label={'Удалить «' + entry.title + '»'}><Trash2 /></Button>} />
      </div>
    </>}
  </li>;
}

export function GeoList({ entries }: { entries: GeoEntry[] }) {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [pending, run] = useAction();
  const search = useDeferredValue(query.trim().toLowerCase());
  const shown = search ? entries.filter(entry => entry.title.toLowerCase().includes(search) || String(entry.id) === search) : entries;

  async function create(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => send('/api/admin/geodb/create', { body: { body: title }, fallback: 'Не удалось добавить запись.' }), { success: 'Запись добавлена' });
    if (result.ok) setTitle('');
  }

  return <Card>
    <form onSubmit={create} className="flex flex-col gap-2 border-b p-4 sm:flex-row">
      <div className="relative flex-1">
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={title} onChange={event => setTitle(event.target.value)} placeholder="Город, линия или станция" aria-label="Новая запись" className="pl-9" required />
      </div>
      <Button type="submit" disabled={pending || !title.trim()}><Plus />Добавить</Button>
    </form>
    {entries.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
      <p className="text-[13px] text-muted-foreground" aria-live="polite">{search ? 'Найдено: ' + shown.length + ' из ' + entries.length : plural(entries.length, 'запись', 'записи', 'записей')}</p>
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти" aria-label="Поиск по GeoDB" className="h-8 pl-9" />
      </div>
    </div>}
    {!entries.length ? <Empty icon={Globe} title="GeoDB пуста">Добавьте места, которые авторы смогут выбирать при загрузке фотографий.</Empty>
      : !shown.length ? <Empty icon={Search} title="Ничего не нашли" />
      : <ul className="mt-2 divide-y">{shown.map(entry => <GeoRow key={entry.id} entry={entry} />)}</ul>}
  </Card>;
}
