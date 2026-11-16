'use client';

import { Database, ExternalLink, List, Pencil, Search, Trash2 } from 'lucide-react';
import { useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import Link from '../../../components/Link';
import { navigate } from '../../../components/navigation';
import { CustomFields, fieldBody, savedValues, useEntityFields } from '../catalog/CustomFields';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, NativeSelect, Textarea } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface ModelRow {
  id: number; title: string; entityid: number; entity: string; color: string; manufacturer: string | null;
  parent_id: number | null; built_from: number | null; built_to: number | null; vehicles: number;
}
export interface EntityOption { id: number; title: string; color: string }
export interface ModelOption { id: number; title: string; entityid: number; parent_id: number | null }
export interface ModelDetails {
  id: number; entityid: number; parent_id: number | null; title: string; manufacturer: string | null;
  built_from: number | null; built_to: number | null; description: string | null; content: string | null; vehicles: number;
}

export const swatch = (color: string) => <span className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: color || 'var(--muted-foreground)' }} />;

function years(model: { built_from: number | null; built_to: number | null }) {
  const { built_from: from, built_to: to } = model;
  if (from && to) return from === to ? String(from) : from + '–' + to;
  return from ? 'с ' + from : to ? 'до ' + to : '';
}

/** Models in tree order: each parent followed by its submodels, indented by depth. */
function treeOrder(models: ModelRow[]) {
  const ids = new Set(models.map(model => model.id));
  const children = new Map<number | null, ModelRow[]>();
  for (const model of models) {
    const parent = model.parent_id && ids.has(model.parent_id) ? model.parent_id : null;
    children.set(parent, [...children.get(parent) ?? [], model]);
  }
  const ordered: { model: ModelRow; depth: number }[] = [];
  const walk = (parent: number | null, depth: number) => {
    for (const model of children.get(parent) ?? []) { ordered.push({ model, depth }); if (depth < 8) walk(model.id, depth + 1); }
  };
  walk(null, 0);
  return ordered;
}

export function ModelsTable({ models, entities, initialEntity, create }: { models: ModelRow[]; entities: EntityOption[]; initialEntity: string; create: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState(initialEntity);
  const [pending, run] = useAction();
  const search = useDeferredValue(query.trim().toLowerCase());
  const shown = useMemo(() => {
    const filtered = models.filter(model => !entity || String(model.entityid) === entity);
    if (!search) return treeOrder(filtered);
    return filtered.filter(model => model.title.toLowerCase().includes(search) || (model.manufacturer ?? '').toLowerCase().includes(search)
      || String(model.id) === search).map(model => ({ model, depth: 0 }));
  }, [models, entity, search]);

  if (!models.length) return <Card><Empty icon={Database} title="Моделей пока нет" action={create}>
    {entities.length ? 'Модель — общая карточка для всех городов, к ней привязываются конкретные ТС.' : 'Сначала создайте сущность в разделе «Сущности».'}</Empty></Card>;

  const actions = (model: ModelRow) => <div className="flex justify-end gap-1">
    <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=Vehicles&model=' + model.id} aria-label="Подвижной состав модели"><List /></Link></Button>
    <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=ModelEdit&id=' + model.id} aria-label="Редактировать"><Pencil /></Link></Button>
    <Confirm title={'Удалить модель «' + model.title + '»?'} description="Это действие нельзя отменить."
      onConfirm={() => run(() => send('/api/admin/models/catalog/' + model.id, { method: 'DELETE', fallback: 'Не удалось удалить модель: у неё есть ТС или подмодели.' }), { success: 'Модель удалена' })}
      trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending || model.vehicles > 0} aria-label="Удалить"
        title={model.vehicles ? 'К модели привязаны ТС' : undefined}><Trash2 /></Button>} />
  </div>;

  return <Card>
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, производитель или ID" aria-label="Поиск моделей" className="pl-9" />
      </div>
      <NativeSelect value={entity} onChange={event => setEntity(event.target.value)} aria-label="Сущность" className="sm:w-60">
        <option value="">Все сущности</option>
        {entities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </NativeSelect>
    </div>
    <p className="px-4 pt-3 text-[13px] text-muted-foreground" aria-live="polite">
      {shown.length === models.length ? plural(models.length, 'модель', 'модели', 'моделей') : 'Найдено: ' + shown.length + ' из ' + models.length}
    </p>
    {!shown.length ? <Empty icon={Search} title="Ничего не нашли">Измените запрос или выберите другую сущность.</Empty> : <>
      <Table className="hidden md:table">
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="w-16">ID</TableHead><TableHead>Модель</TableHead><TableHead>Сущность</TableHead>
          <TableHead>Выпуск</TableHead><TableHead className="text-right">ТС</TableHead><TableHead className="w-32" />
        </TableRow></TableHeader>
        <TableBody>{shown.map(({ model, depth }) => <TableRow key={model.id}>
          <TableCell className="text-muted-foreground tabular-nums">{model.id}</TableCell>
          <TableCell className="max-w-md" style={{ paddingLeft: 8 + depth * 20 }}>
            {depth > 0 && <span className="mr-1 text-muted-foreground">└</span>}
            <Link href={'/admin?type=ModelEdit&id=' + model.id} className="font-medium hover:underline">{model.title}</Link>
            <a href={'/model/' + model.id} target="_blank" className="ml-1.5 inline-block align-middle text-muted-foreground hover:text-foreground" aria-label="Открыть на сайте"><ExternalLink className="size-3.5" /></a>
            {model.manufacturer && <p className="truncate text-[13px] text-muted-foreground">{model.manufacturer}</p>}
          </TableCell>
          <TableCell><span className="inline-flex items-center gap-2 text-sm">{swatch(model.color)}{model.entity || '—'}</span></TableCell>
          <TableCell className="text-sm tabular-nums">{years(model) || '—'}</TableCell>
          <TableCell className="text-right tabular-nums">{model.vehicles}</TableCell>
          <TableCell>{actions(model)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
      <ul className="divide-y md:hidden">{shown.map(({ model, depth }) => <li key={model.id} className="flex items-center gap-3 px-4 py-3" style={{ paddingLeft: 16 + depth * 16 }}>
        <div className="min-w-0 flex-1">
          <Link href={'/admin?type=ModelEdit&id=' + model.id} className="block truncate font-medium">{model.title}</Link>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">{swatch(model.color)}<span className="truncate">{model.entity}</span>, {model.vehicles} ТС</p>
        </div>
        {actions(model)}
      </li>)}</ul>
    </>}
  </Card>;
}

/** Models of `entity` that may become the parent of `self`: not itself and not one of its own submodels. */
function parentOptions(models: ModelOption[], entity: string, self?: number) {
  const blocked = new Set<number>();
  if (self) {
    blocked.add(self);
    let grew = true;
    while (grew) {
      grew = false;
      for (const model of models) if (model.parent_id && blocked.has(model.parent_id) && !blocked.has(model.id)) { blocked.add(model.id); grew = true; }
    }
  }
  return models.filter(model => String(model.entityid) === entity && !blocked.has(model.id));
}

export function ModelForm({ entities, models, model, initialEntity }: { entities: EntityOption[]; models: ModelOption[]; model?: ModelDetails; initialEntity?: string }) {
  const [entity, setEntity] = useState(model ? String(model.entityid) : initialEntity ?? '');
  const [form, setForm] = useState({
    title: model?.title ?? '', parent_id: model?.parent_id ? String(model.parent_id) : '', manufacturer: model?.manufacturer ?? '',
    built_from: model?.built_from ? String(model.built_from) : '', built_to: model?.built_to ? String(model.built_to) : '', description: model?.description ?? '',
  });
  const { fields, error } = useEntityFields(entity);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [pending, run] = useAction();
  const values = useMemo(() => ({ ...(fields && model ? savedValues(model.content, fields) : {}), ...edited }), [fields, model, edited]);
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = { ...(model ? {} : { entityid: entity }), ...form, ...fieldBody(fields, 'model', values) };
    const result = await run(() => model
      ? send('/api/admin/models/catalog/' + model.id, { method: 'PATCH', body, fallback: 'Не удалось сохранить модель. Проверьте поля.' })
      : send('/api/admin/models/catalog', { body, fallback: 'Не удалось добавить модель. Проверьте поля.' }),
    { success: model ? 'Модель сохранена' : 'Модель добавлена', refresh: false });
    if (result.ok) navigate('/admin?type=Models' + (model ? '' : '&entity=' + entity), { refresh: true });
  }

  const current = entities.find(item => String(item.id) === entity);
  const parents = parentOptions(models, entity, model?.id);
  return <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <Card>
      <CardHeader><CardTitle>Модель</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <Field><Label htmlFor="model-entity">Сущность</Label>
          <NativeSelect id="model-entity" value={entity} onChange={event => { setEntity(event.target.value); setEdited({}); setForm(f => ({ ...f, parent_id: '' })); }} disabled={!!model} required>
            <option value="" disabled>Выберите сущность</option>
            {entities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </NativeSelect></Field>
        <Field><Label htmlFor="model-title">Название</Label>
          <Input id="model-title" value={form.title} onChange={set('title')} placeholder="71-931М «Витязь-М»" maxLength={255} required /></Field>
        <Field><Label htmlFor="model-manufacturer">Производитель</Label>
          <Input id="model-manufacturer" value={form.manufacturer} onChange={set('manufacturer')} placeholder="ПК Транспортные системы" maxLength={255} />
          <FieldDescription>По нему модели группируются в списке на сайте.</FieldDescription></Field>
        <Field><Label htmlFor="model-parent">Родительская модель</Label>
          <NativeSelect id="model-parent" value={form.parent_id} onChange={set('parent_id')} disabled={!entity}>
            <option value="">Нет — самостоятельная модель</option>
            {parents.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </NativeSelect>
          <FieldDescription>Модификация показывается внутри родительской модели.</FieldDescription></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field><Label htmlFor="model-from">Выпуск с</Label>
            <Input id="model-from" value={form.built_from} onChange={set('built_from')} inputMode="numeric" pattern="\d{4}" placeholder="ГГГГ" /></Field>
          <Field><Label htmlFor="model-to">по</Label>
            <Input id="model-to" value={form.built_to} onChange={set('built_to')} inputMode="numeric" pattern="\d{4}" placeholder="ГГГГ" /></Field>
        </div>
        <Field><Label htmlFor="model-description">Описание</Label>
          <Textarea id="model-description" value={form.description} onChange={set('description')} rows={6} /></Field>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><div>
        <CardTitle className="flex items-center gap-2">{current && swatch(current.color)}Характеристики</CardTitle>
        <CardDescription>{current ? 'Поля модели из шаблона сущности «' + current.title + '».' : 'Выберите сущность, чтобы заполнить её поля.'}</CardDescription>
      </div></CardHeader>
      <CardContent className="grid gap-4">
        {entity && <CustomFields fields={fields} error={error} scope="model" values={values} onChange={(key, value) => setEdited(list => ({ ...list, [key]: value }))} />}
      </CardContent>
      <CardFooter>
        {model && <Button type="button" variant="ghost" asChild className="mr-auto"><a href={'/model/' + model.id} target="_blank"><ExternalLink />На сайте</a></Button>}
        <Button type="button" variant="ghost" asChild><Link href="/admin?type=Models">Отмена</Link></Button>
        <Button type="submit" disabled={pending || !fields}>{model ? 'Сохранить' : 'Добавить модель'}</Button>
      </CardFooter>
    </Card>
  </form>;
}
