'use client';

import { Check, Globe, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { GeoKind, geoKinds, geoParentKinds, type GeoNode } from '@nativegallery/contracts';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Input, NativeSelect } from '../ui/input';

export type GeoEntry = GeoNode & { vehicles: number };
type Draft = { title: string; kind: string; parent_id: string; code: string; sort: string };

const kindLabel = (kind: number) => geoKinds.find(item => item.id === kind)?.label ?? 'Место';
const draftOf = (entry?: GeoEntry, parent?: GeoEntry): Draft => entry
  ? { title: entry.title, kind: String(entry.kind), parent_id: entry.parent_id ? String(entry.parent_id) : '', code: entry.code ?? '', sort: String(entry.sort ?? 0) }
  : { title: '', kind: String(parent ? childKind(parent.kind) : GeoKind.Country), parent_id: parent ? String(parent.id) : '', code: '', sort: '0' };

/** The kind a new child of `kind` most likely has. */
function childKind(kind: number) {
  return kind === GeoKind.Country ? GeoKind.City : kind === GeoKind.Region ? GeoKind.City : kind === GeoKind.City ? GeoKind.Depot : GeoKind.Place;
}

/** Entries in tree order with their depth; orphans (parent removed) go to the top level. */
function treeOrder(entries: GeoEntry[]) {
  const ids = new Set(entries.map(entry => entry.id));
  const children = new Map<number | null, GeoEntry[]>();
  for (const entry of entries) {
    const parent = entry.parent_id && ids.has(entry.parent_id) ? entry.parent_id : null;
    children.set(parent, [...children.get(parent) ?? [], entry]);
  }
  const ordered: { entry: GeoEntry; depth: number }[] = [];
  const walk = (parent: number | null, depth: number) => {
    const list = [...children.get(parent) ?? []].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title, 'ru'));
    for (const entry of list) { ordered.push({ entry, depth }); if (depth < 8) walk(entry.id, depth + 1); }
  };
  walk(null, 0);
  return ordered;
}

/** Full path of an entry («Россия → Санкт-Петербург»), for parent options. */
function pathOf(entry: GeoEntry, byId: Map<number, GeoEntry>) {
  const parts = [entry.title];
  let parent = entry.parent_id ? byId.get(entry.parent_id) : undefined;
  for (let depth = 0; parent && depth < 8; depth++) { parts.unshift(parent.title); parent = parent.parent_id ? byId.get(parent.parent_id) : undefined; }
  return parts.join(' → ');
}

function GeoForm({ draft, setDraft, entries, self, children }: {
  draft: Draft; setDraft: (draft: Draft) => void; entries: GeoEntry[]; self?: GeoEntry; children: React.ReactNode;
}) {
  const byId = useMemo(() => new Map(entries.map(entry => [entry.id, entry])), [entries]);
  const allowed = geoParentKinds(Number(draft.kind));
  const parents = entries.filter(entry => allowed.includes(entry.kind) && entry.id !== self?.id)
    .map(entry => ({ id: entry.id, label: pathOf(entry, byId) })).sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  const set = (key: keyof Draft) => (event: { target: { value: string } }) => setDraft({ ...draft, [key]: event.target.value });
  return <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_9rem_minmax(0,1.4fr)_5rem_5rem_auto]">
    <Input value={draft.title} onChange={set('title')} placeholder="Название" aria-label="Название" maxLength={255} required autoFocus={!!self} />
    <NativeSelect value={draft.kind} aria-label="Тип"
      onChange={event => { const kind = Number(event.target.value); const parent = byId.get(Number(draft.parent_id));
        setDraft({ ...draft, kind: event.target.value, parent_id: parent && geoParentKinds(kind).includes(parent.kind) ? draft.parent_id : '' }); }}>
      {geoKinds.map(kind => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
    </NativeSelect>
    <NativeSelect value={draft.parent_id} onChange={set('parent_id')} aria-label="Входит в" disabled={!allowed.length}
      required={Number(draft.kind) === GeoKind.Depot}>
      <option value="">{allowed.length ? 'Верхний уровень' : '— страна верхнего уровня —'}</option>
      {parents.map(parent => <option key={parent.id} value={parent.id}>{parent.label}</option>)}
    </NativeSelect>
    <Input value={draft.code} onChange={set('code')} placeholder="Код" aria-label="Код (например, ru или spb)" maxLength={8} className="font-mono" />
    <Input value={draft.sort} onChange={set('sort')} type="number" aria-label="Порядок" title="Порядок сортировки" />
    <div className="flex gap-1">{children}</div>
  </div>;
}

function GeoRow({ entry, depth, entries, onAdd }: { entry: GeoEntry; depth: number; entries: GeoEntry[]; onAdd: (parent: GeoEntry) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, run] = useAction();
  const hasChildren = entries.some(item => item.parent_id === entry.id);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const result = await run(() => send('/api/admin/geodb/' + entry.id, { method: 'PATCH', body: draft, fallback: 'Не удалось сохранить запись.' }), { success: 'Запись сохранена' });
    if (result.ok) setDraft(null);
  }

  return <li className="flex items-center gap-3 py-2 pr-4" style={{ paddingLeft: 16 + depth * 22 }}>
    <span className="w-10 shrink-0 text-[13px] text-muted-foreground tabular-nums">{entry.id}</span>
    {draft ? <form onSubmit={submit} className="flex flex-1">
      <GeoForm draft={draft} setDraft={setDraft} entries={entries} self={entry}>
        <Button type="submit" size="icon-sm" disabled={pending || !draft.title.trim()} aria-label="Сохранить"><Check /></Button>
        <Button type="button" size="icon-sm" variant="ghost" onClick={() => setDraft(null)} aria-label="Отмена"><X /></Button>
      </GeoForm>
    </form> : <>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className={'truncate text-sm' + (entry.kind <= GeoKind.City ? ' font-medium' : '')}>{entry.title}</span>
        <Badge variant={entry.kind === GeoKind.Country ? 'info' : 'outline'} className="text-[11px]">{kindLabel(entry.kind)}</Badge>
        {entry.code && <span className="font-mono text-[12px] text-muted-foreground">{entry.code}</span>}
        {entry.vehicles > 0 && <span className="text-[12px] text-muted-foreground">{plural(entry.vehicles, 'ТС', 'ТС', 'ТС')}</span>}
      </div>
      <div className="flex gap-1">
        {entry.kind !== GeoKind.Place && entry.kind !== GeoKind.Depot && <Button size="icon-sm" variant="ghost" onClick={() => onAdd(entry)} aria-label={'Добавить внутрь «' + entry.title + '»'}><Plus /></Button>}
        <Button size="icon-sm" variant="ghost" onClick={() => setDraft(draftOf(entry))} aria-label={'Изменить «' + entry.title + '»'}><Pencil /></Button>
        <Confirm title={'Удалить «' + entry.title + '»?'} description="Запись пропадёт из подсказок при загрузке фотографий."
          onConfirm={() => run(() => send('/api/admin/geodb/' + entry.id, { method: 'DELETE', fallback: 'Не удалось удалить запись: внутри есть другие записи или к ней привязаны ТС.' }), { success: 'Запись удалена' })}
          trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending || hasChildren || entry.vehicles > 0} aria-label={'Удалить «' + entry.title + '»'}
            title={hasChildren ? 'Внутри есть другие записи' : entry.vehicles ? 'К записи привязаны ТС' : undefined}><Trash2 /></Button>} />
      </div>
    </>}
  </li>;
}

export function GeoList({ entries }: { entries: GeoEntry[] }) {
  const [draft, setDraft] = useState<Draft>(() => draftOf());
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [pending, run] = useAction();
  const search = useDeferredValue(query.trim().toLowerCase());
  const shown = useMemo(() => {
    if (!search && !kind) return treeOrder(entries);
    return entries.filter(entry => (!kind || String(entry.kind) === kind) &&
      (!search || entry.title.toLowerCase().includes(search) || entry.code === search || String(entry.id) === search))
      .map(entry => ({ entry, depth: 0 }));
  }, [entries, search, kind]);

  async function create(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => send('/api/admin/geodb', { body: draft, fallback: 'Не удалось добавить запись. Проверьте тип и родителя.' }), { success: 'Запись добавлена' });
    if (result.ok) setDraft({ ...draftOf(), kind: draft.kind, parent_id: draft.parent_id });
  }

  return <Card>
    <form onSubmit={create} className="flex flex-col gap-2 border-b p-4">
      <p className="text-[13px] text-muted-foreground">Страны → регионы → города → депо и парки. Город и депо нужны, чтобы привязать к ним подвижной состав.</p>
      <GeoForm draft={draft} setDraft={setDraft} entries={entries}>
        <Button type="submit" disabled={pending || !draft.title.trim()}><Plus />Добавить</Button>
      </GeoForm>
    </form>
    {entries.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
      <p className="text-[13px] text-muted-foreground" aria-live="polite">{search || kind ? 'Найдено: ' + shown.length + ' из ' + entries.length : plural(entries.length, 'запись', 'записи', 'записей')}</p>
      <div className="flex w-full gap-2 sm:w-auto">
        <NativeSelect value={kind} onChange={event => setKind(event.target.value)} aria-label="Тип" className="h-8 sm:w-40">
          <option value="">Все типы</option>
          {geoKinds.map(item => <option key={item.id} value={item.id}>{item.plural}</option>)}
        </NativeSelect>
        <div className="relative flex-1 sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти" aria-label="Поиск по GeoDB" className="h-8 pl-9" />
        </div>
      </div>
    </div>}
    {!entries.length ? <Empty icon={Globe} title="GeoDB пуста">Начните со страны, затем добавьте в неё города и депо.</Empty>
      : !shown.length ? <Empty icon={Search} title="Ничего не нашли" />
      : <ul className="mt-2 divide-y">{shown.map(({ entry, depth }) => <GeoRow key={entry.id} entry={entry} depth={depth} entries={entries}
        onAdd={parent => { setDraft(draftOf(undefined, parent)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />)}</ul>}
  </Card>;
}
