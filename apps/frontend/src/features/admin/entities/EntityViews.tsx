'use client';

import { ArrowDown, ArrowUp, Boxes, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Link from '../../../components/Link';
import { navigate } from '../../../components/navigation';
import { formatDate, plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, NativeSelect } from '../ui/input';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { fieldTypes } from '@nativegallery/contracts';

export interface EntityRow { id: number; title: string; color: string; createdAt: number; fields: number; models: number; vehicles: number }
export interface EntityField { name: string; id: string; type: string; important: string; scope: 'model' | 'vehicle'; list: string }
export interface EntityDetails { id: number; title: string; color: string; fields: EntityField[]; models: number; vehicles: number }

export function EntitiesTable({ entities, create }: { entities: EntityRow[]; create: React.ReactNode }) {
  const [pending, run] = useAction();
  if (!entities.length) return <Card><Empty icon={Boxes} title="Сущностей пока нет" action={create}>
    Сущность — это тип подвижного состава (например, «Вагон метро») со своим набором полей для моделей.</Empty></Card>;
  const actions = (entity: EntityRow) => <div className="flex justify-end gap-1">
    <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=EntityUpdate&id=' + entity.id} aria-label="Редактировать"><Pencil /></Link></Button>
    <Confirm title={'Удалить сущность «' + entity.title + '»?'} description="Её поля и заявки на ТС будут удалены. Это действие нельзя отменить."
      onConfirm={() => run(() => send('/api/admin/entities/' + entity.id, { method: 'DELETE', fallback: 'Не удалось удалить сущность.' }), { success: 'Сущность удалена' })}
      trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending || entity.models + entity.vehicles > 0} aria-label="Удалить"
        title={entity.models + entity.vehicles ? 'Сначала удалите модели и ТС этой сущности' : undefined}><Trash2 /></Button>} />
  </div>;
  const swatch = (color: string) => <span className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: color }} />;
  return <Card>
    <Table className="hidden md:table">
      <TableHeader><TableRow className="hover:bg-transparent">
        <TableHead className="w-14">ID</TableHead><TableHead>Название</TableHead><TableHead className="text-right">Поля</TableHead>
        <TableHead className="text-right">Модели</TableHead><TableHead className="text-right">ТС</TableHead><TableHead>Создана</TableHead><TableHead className="w-24" />
      </TableRow></TableHeader>
      <TableBody>{entities.map(entity => <TableRow key={entity.id}>
        <TableCell className="text-muted-foreground tabular-nums">{entity.id}</TableCell>
        <TableCell><Link href={'/admin?type=EntityUpdate&id=' + entity.id} className="inline-flex items-center gap-2.5 font-medium hover:underline">{swatch(entity.color)}{entity.title}</Link></TableCell>
        <TableCell className="text-right tabular-nums">{entity.fields}</TableCell>
        <TableCell className="text-right tabular-nums"><Link href={'/admin?type=Models&entity=' + entity.id} className="hover:underline">{entity.models}</Link></TableCell>
        <TableCell className="text-right tabular-nums"><Link href={'/admin?type=Vehicles&entity=' + entity.id} className="hover:underline">{entity.vehicles}</Link></TableCell>
        <TableCell className="text-[13px] text-muted-foreground">{formatDate(entity.createdAt, { time: false })}</TableCell>
        <TableCell>{actions(entity)}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
    <ul className="divide-y md:hidden">{entities.map(entity => <li key={entity.id} className="flex items-center gap-3 px-4 py-3">
      {swatch(entity.color)}
      <div className="min-w-0 flex-1">
        <Link href={'/admin?type=EntityUpdate&id=' + entity.id} className="block truncate font-medium">{entity.title}</Link>
        <p className="text-[13px] text-muted-foreground">{plural(entity.fields, 'поле', 'поля', 'полей')}, {plural(entity.models, 'модель', 'модели', 'моделей')}, {entity.vehicles} ТС</p>
      </div>
      {actions(entity)}
    </li>)}</ul>
  </Card>;
}

type Row = EntityField & { key: number; locked: boolean };

export function EntityForm({ entity }: { entity?: EntityDetails }) {
  const locked = (entity?.models ?? 0) + (entity?.vehicles ?? 0) > 0;
  const [title, setTitle] = useState(entity?.title ?? '');
  const [color, setColor] = useState(entity?.color ?? '#2052d0');
  const [rows, setRows] = useState<Row[]>(() => (entity ? entity.fields : [])
    .map((field, index) => ({ ...field, key: index, locked: locked && !!entity })));
  const [next, setNext] = useState(rows.length);
  const [pending, run] = useAction();

  const update = (key: number, patch: Partial<EntityField>) => setRows(list => list.map(row => row.key === key ? { ...row, ...patch } : row));
  const move = (index: number, by: number) => setRows(list => {
    const copy = [...list];
    [copy[index], copy[index + by]] = [copy[index + by], copy[index]];
    return copy;
  });
  const duplicate = (() => {
    const seen = new Set<string>();
    for (const row of rows) { const id = row.id.trim(); if (id && seen.has(id)) return id; seen.add(id); }
    return null;
  })();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body: Record<string, string> = { title, color };
    rows.forEach((row, index) => {
      const n = index + 1;
      body['variablename_' + n] = row.name; body['variableid_' + n] = row.id;
      body['variabletype_' + n] = row.type; body['variableimportant_' + n] = row.important;
      body['variablescope_' + n] = row.scope; body['variablelist_' + n] = row.scope === 'vehicle' ? row.list : '0';
    });
    const result = await run(() => entity
      ? send('/api/admin/entities/' + entity.id, { method: 'PATCH', body, fallback: 'Не удалось сохранить сущность. Проверьте поля.' })
      : send('/api/admin/entities', { body, fallback: 'Не удалось создать сущность. Проверьте поля.' }),
    { success: entity ? 'Сущность сохранена' : 'Сущность создана', refresh: false });
    if (result.ok) navigate('/admin?type=Entities', { refresh: true });
  }

  return <form onSubmit={submit} className="grid gap-6">
    <Card>
      <CardHeader><CardTitle>Основное</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Field><Label htmlFor="entity-title">Название</Label>
          <Input id="entity-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Вагон метро" maxLength={255} required /></Field>
        <Field><Label htmlFor="entity-color">Цвет</Label>
          <div className="flex items-center gap-2">
            <input id="entity-color" type="color" value={color} onChange={event => setColor(event.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-input bg-card p-1 shadow-xs" />
            <Input value={color} onChange={event => setColor(event.target.value)} pattern="#[0-9a-fA-F]{6}" aria-label="Цвет в HEX" className="w-28 font-mono" />
          </div></Field>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><div>
        <CardTitle>Свои поля</CardTitle>
        <CardDescription>Дополнительные поля сверх стандартных (город, депо, модель, даты, заводской №, состояние, назначение).
          Поле уровня «Модель» заполняется один раз в карточке модели, уровня «ТС» — у каждого экземпляра; такие поля можно вывести колонкой в списке подвижного состава.
          {locked && ' У сущности уже есть модели или ТС: существующие поля нельзя удалять и переставлять, потому что значения хранятся по номеру поля.'}</CardDescription>
      </div></CardHeader>
      <CardContent className="grid gap-3">
        {rows.length > 0 && <div className="hidden grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_7rem_7.5rem_auto_auto_5.5rem] gap-3 px-1 text-[13px] font-medium text-muted-foreground lg:grid">
          <span>№</span><span>Подпись</span><span>Идентификатор</span><span>Уровень</span><span>Тип</span><span>Обязательно</span><span>В списке ПС</span><span />
        </div>}
        {!rows.length && <p className="text-sm text-muted-foreground">Своих полей нет — будут только стандартные.</p>}
        {rows.map((row, index) => <div key={row.key} className="grid grid-cols-2 gap-3 rounded-lg border p-3 lg:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_7rem_7.5rem_auto_auto_5.5rem] lg:items-center lg:border-0 lg:p-1">
          <span className="col-span-2 text-sm text-muted-foreground tabular-nums lg:col-span-1 lg:text-center">{index + 1}</span>
          <div className="col-span-2 lg:col-span-1"><Input value={row.name} onChange={event => update(row.key, { name: event.target.value })}
            placeholder="Тип двигателя" aria-label={'Подпись поля ' + (index + 1)} maxLength={255} required /></div>
          <div className="col-span-2 lg:col-span-1"><Input value={row.id} onChange={event => update(row.key, { id: event.target.value })}
            placeholder="engine" aria-label={'Идентификатор поля ' + (index + 1)} maxLength={64} required className="font-mono text-[13px]"
            aria-invalid={duplicate !== null && row.id.trim() === duplicate} /></div>
          <NativeSelect value={row.scope} onChange={event => update(row.key, { scope: event.target.value as EntityField['scope'] })} aria-label={'Уровень поля ' + (index + 1)}>
            <option value="model">Модель</option><option value="vehicle">ТС</option>
          </NativeSelect>
          <NativeSelect value={row.type} onChange={event => update(row.key, { type: event.target.value })} aria-label={'Тип поля ' + (index + 1)}>
            {fieldTypes.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
          </NativeSelect>
          <label className="flex items-center gap-2 text-sm lg:justify-center">
            <Switch checked={row.important === '1'} onCheckedChange={value => update(row.key, { important: value ? '1' : '2' })} aria-label={'Поле ' + (index + 1) + ' обязательно'} />
            <span className="lg:sr-only">Обязательно</span>
          </label>
          <label className="flex items-center gap-2 text-sm lg:justify-center" title={row.scope === 'model' ? 'Только для полей уровня ТС' : undefined}>
            <Switch checked={row.scope === 'vehicle' && row.list === '1'} disabled={row.scope !== 'vehicle'}
              onCheckedChange={value => update(row.key, { list: value ? '1' : '0' })} aria-label={'Поле ' + (index + 1) + ' в списке подвижного состава'} />
            <span className="lg:sr-only">В списке ПС</span>
          </label>
          <div className="col-span-2 flex justify-end gap-0.5 lg:col-span-1">
            <Button type="button" size="icon-sm" variant="ghost" disabled={index === 0 || locked} onClick={() => move(index, -1)} aria-label="Выше"><ArrowUp /></Button>
            <Button type="button" size="icon-sm" variant="ghost" disabled={index === rows.length - 1 || locked} onClick={() => move(index, 1)} aria-label="Ниже"><ArrowDown /></Button>
            <Button type="button" size="icon-sm" variant="ghost-destructive" disabled={row.locked}
              onClick={() => setRows(list => list.filter(item => item.key !== row.key))} aria-label="Убрать поле"><X /></Button>
          </div>
        </div>)}
        {duplicate !== null && <FieldDescription className="text-destructive">Идентификатор «{duplicate}» повторяется: у каждого поля он должен быть своим.</FieldDescription>}
        <Button type="button" variant="outline" className="w-fit" disabled={rows.length >= 99}
          onClick={() => { setRows(list => [...list, { name: '', id: '', type: '1', important: '2', scope: 'vehicle', list: '0', key: next, locked: false }]); setNext(next + 1); }}>
          <Plus />Добавить поле
        </Button>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="ghost" asChild><Link href="/admin?type=Entities">Отмена</Link></Button>
        <Button type="submit" disabled={pending || duplicate !== null}>{entity ? 'Сохранить' : 'Создать сущность'}</Button>
      </CardFooter>
    </Card>
  </form>;
}
