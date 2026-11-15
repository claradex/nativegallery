'use client';

import { Database, Pencil, Search, Trash2 } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from '../../../components/Link';
import { navigate } from '../../../components/navigation';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Field, FieldError, Label } from '../ui/field';
import { Input, NativeSelect, Textarea } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface ModelRow { id: number; title: string; model: string; entityid: number; color: string; comment: string | null; photos: number }
export interface EntityOption { id: number; title: string; color: string }
export interface ModelDetails { id: number; entityid: number; title: string; comment: string | null; content: string | null }

const swatch = (color: string) => <span className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: color || 'var(--muted-foreground)' }} />;

export function ModelsTable({ models, entities, initialEntity, create }: { models: ModelRow[]; entities: EntityOption[]; initialEntity: string; create: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState(initialEntity);
  const [pending, run] = useAction();
  const search = useDeferredValue(query.trim().toLowerCase());
  const shown = useMemo(() => models.filter(model => (!entity || String(model.entityid) === entity) &&
    (!search || model.title.toLowerCase().includes(search) || (model.comment ?? '').toLowerCase().includes(search) || String(model.id) === search)),
  [models, entity, search]);

  if (!models.length) return <Card><Empty icon={Database} title="Моделей пока нет" action={create}>
    {entities.length ? 'Добавьте модель вручную или примите заявку от пользователя.' : 'Сначала создайте сущность в разделе «Сущности».'}</Empty></Card>;

  const actions = (model: ModelRow) => <div className="flex justify-end gap-1">
    <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=ModelEdit&id=' + model.id} aria-label="Редактировать"><Pencil /></Link></Button>
    <Confirm title={'Удалить модель «' + model.title + '»?'} description="Это действие нельзя отменить."
      onConfirm={() => run(() => send('/api/admin/models/catalog/' + model.id, { method: 'DELETE', fallback: 'Не удалось удалить модель.' }), { success: 'Модель удалена' })}
      trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending || model.photos > 0} aria-label="Удалить"
        title={model.photos ? 'К модели привязаны фотографии' : undefined}><Trash2 /></Button>} />
  </div>;

  return <Card>
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, описание или ID" aria-label="Поиск моделей" className="pl-9" />
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
          <TableHead className="w-16">ID</TableHead><TableHead>Модель</TableHead><TableHead>Сущность</TableHead><TableHead className="text-right">Фото</TableHead><TableHead className="w-24" />
        </TableRow></TableHeader>
        <TableBody>{shown.map(model => <TableRow key={model.id}>
          <TableCell className="text-muted-foreground tabular-nums">{model.id}</TableCell>
          <TableCell className="max-w-md">
            <Link href={'/admin?type=ModelEdit&id=' + model.id} className="font-medium hover:underline">{model.title}</Link>
            {model.comment && <p className="truncate text-[13px] text-muted-foreground">{model.comment}</p>}
          </TableCell>
          <TableCell><span className="inline-flex items-center gap-2 text-sm">{swatch(model.color)}{model.model || '—'}</span></TableCell>
          <TableCell className="text-right tabular-nums">{model.photos}</TableCell>
          <TableCell>{actions(model)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
      <ul className="divide-y md:hidden">{shown.map(model => <li key={model.id} className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link href={'/admin?type=ModelEdit&id=' + model.id} className="block truncate font-medium">{model.title}</Link>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">{swatch(model.color)}<span className="truncate">{model.model}</span>, {model.photos} фото</p>
        </div>
        {actions(model)}
      </li>)}</ul>
    </>}
  </Card>;
}

type Schema = { name: string; label: string; required: boolean }[];

function savedValues(content: string | null | undefined): Record<string, { value?: unknown } | null> {
  try { const value = JSON.parse(content ?? '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}

export function ModelForm({ entities, model }: { entities: EntityOption[]; model?: ModelDetails }) {
  const [entity, setEntity] = useState(model ? String(model.entityid) : '');
  const [title, setTitle] = useState(model?.title ?? '');
  const [comment, setComment] = useState(model?.comment ?? '');
  const [schema, setSchema] = useState<Schema | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, run] = useAction();

  useEffect(() => {
    if (!entity) { setSchema(null); return; }
    const request = new AbortController();
    setSchema(null); setError('');
    fetch('/api/admin/models/fields/' + encodeURIComponent(entity), { signal: request.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<Schema>; })
      .then(fields => {
        const saved = model && String(model.entityid) === entity ? savedValues(model.content) : {};
        setValues(Object.fromEntries(fields.map((field, index) => [field.name, String(saved[index + 1]?.value ?? '')])));
        setSchema(fields);
      })
      .catch(() => { if (!request.signal.aborted) setError('Не удалось загрузить поля сущности.'); });
    return () => request.abort();
  }, [entity, model]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = { entityid: entity, title, comment, ...values };
    const result = await run(() => model
      ? send('/api/admin/models/catalog/' + model.id, { method: 'PATCH', body, fallback: 'Не удалось сохранить модель. Проверьте обязательные поля.' })
      : send('/api/admin/models/catalog', { body, fallback: 'Не удалось добавить модель. Проверьте обязательные поля.' }),
    { success: model ? 'Модель сохранена' : 'Модель добавлена', refresh: false });
    if (result.ok) navigate('/admin?type=Models', { refresh: true });
  }

  const current = entities.find(item => String(item.id) === entity);
  return <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <Card>
      <CardHeader><CardTitle>Модель</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <Field><Label htmlFor="model-entity">Сущность</Label>
          <NativeSelect id="model-entity" value={entity} onChange={event => setEntity(event.target.value)} disabled={!!model} required>
            <option value="" disabled>Выберите сущность</option>
            {entities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </NativeSelect></Field>
        <Field><Label htmlFor="model-title">Название</Label>
          <Input id="model-title" value={title} onChange={event => setTitle(event.target.value)} required /></Field>
        <Field><Label htmlFor="model-comment">Описание</Label>
          <Textarea id="model-comment" value={comment} onChange={event => setComment(event.target.value)} rows={4} required /></Field>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><div>
        <CardTitle className="flex items-center gap-2">{current && swatch(current.color)}Характеристики</CardTitle>
        <CardDescription>{current ? 'Поля сущности «' + current.title + '».' : 'Выберите сущность, чтобы заполнить её поля.'}</CardDescription>
      </div></CardHeader>
      <CardContent className="grid gap-4">
        <FieldError>{error}</FieldError>
        {entity && !schema && !error && <div className="grid gap-3" aria-busy>{[0, 1, 2].map(item => <div key={item} className="h-14 animate-pulse rounded-md bg-muted" />)}</div>}
        {schema?.map(field => <Field key={field.name}>
          <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-destructive" aria-hidden>*</span>}</Label>
          <Input id={field.name} value={values[field.name] ?? ''} required={field.required}
            onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} />
        </Field>)}
        {schema && !schema.length && <p className="text-sm text-muted-foreground">У сущности нет полей.</p>}
      </CardContent>
      <CardFooter>
        <Button type="button" variant="ghost" asChild><Link href="/admin?type=Models">Отмена</Link></Button>
        <Button type="submit" disabled={pending || !schema}>{model ? 'Сохранить' : 'Добавить модель'}</Button>
      </CardFooter>
    </Card>
  </form>;
}
