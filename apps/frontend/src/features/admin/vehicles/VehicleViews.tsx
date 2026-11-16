'use client';

import { ExternalLink, Pencil, Search, TrainFront, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { formatPartialDate, vehiclePurposes, vehicleStatus, vehicleStatuses, type CityRef, type VehicleSummary } from '@nativegallery/contracts';
import Link from '../../../components/Link';
import { navigate } from '../../../components/navigation';
import { CustomFields, datePlaceholder, fieldBody, savedValues, useEntityFields } from '../catalog/CustomFields';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { swatch, type EntityOption, type ModelOption } from '../models/ModelViews';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, NativeSelect, Textarea } from '../ui/input';
import { Pagination } from '../ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface VehicleOptions {
  entities: EntityOption[]; models: ModelOption[]; cities: CityRef[]; depots: { id: number; title: string; parent_id: number | null }[];
}
export interface VehiclePage { total: number; page: number; pages: number; vehicles: (VehicleSummary & { entityid: number })[] }
export interface VehicleDetails {
  id: number; entityid: number; title: string; comment: string | null; content: string | null;
  model_id: number | null; city_id: number | null; depot_id: number | null; factory_number: string | null; vin: string | null;
  built: string | null; started: string | null; retired: string | null; scrapped: string | null; status: number; purpose: number; photos: number;
}
export type VehicleFilters = { entity: string; model: string; city: string; q: string };

const cityLabel = (city: CityRef) => city.title + (city.country ? ' (' + city.country.title + ')' : '');

/** Badge colours for the statuses, close to the shades the public list uses. */
const statusVariant = (status: number) => status === 1 ? 'success' as const : status === 4 ? 'destructive' as const : 'secondary' as const;

export function VehiclesTable({ data, options, filters, create }: { data: VehiclePage; options: VehicleOptions; filters: VehicleFilters; create: React.ReactNode }) {
  const [pending, run] = useAction();
  const [entity, setEntity] = useState(filters.entity);
  const models = options.models.filter(model => !entity || String(model.entityid) === entity);
  const entities = new Map(options.entities.map(item => [item.id, item]));
  const filtered = Object.values(filters).some(Boolean);
  const href = (page: number) => '/admin?' + new URLSearchParams({ type: 'Vehicles', ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), ...(page > 1 ? { page: String(page) } : {}) });

  const actions = (vehicle: VehiclePage['vehicles'][number]) => <div className="flex justify-end gap-1">
    <Button size="icon-sm" variant="ghost" asChild><a href={'/vehicle/' + vehicle.id + '/'} target="_blank" aria-label="Открыть на сайте"><ExternalLink /></a></Button>
    <Button size="icon-sm" variant="ghost" asChild><Link href={'/admin?type=VehicleEdit&id=' + vehicle.id} aria-label="Редактировать"><Pencil /></Link></Button>
    <Confirm title={'Удалить ТС № ' + vehicle.number + '?'} description="Это действие нельзя отменить."
      onConfirm={() => run(() => send('/api/admin/vehicles/' + vehicle.id, { method: 'DELETE', fallback: 'Не удалось удалить ТС: к нему привязаны фотографии.' }), { success: 'ТС удалено' })}
      trigger={<Button size="icon-sm" variant="ghost-destructive" disabled={pending || vehicle.photos > 0} aria-label="Удалить"
        title={vehicle.photos ? 'К ТС привязаны фотографии' : undefined}><Trash2 /></Button>} />
  </div>;

  return <Card>
    <form action="/admin" method="get" role="search" className="grid gap-3 border-b p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_12rem_14rem_14rem_auto]">
      <input type="hidden" name="type" value="Vehicles" />
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" name="q" defaultValue={filters.q} placeholder="Номер, заводской №, примечание или ID" aria-label="Поиск ТС" className="pl-9" />
      </div>
      <NativeSelect name="entity" value={entity} onChange={event => setEntity(event.target.value)} aria-label="Сущность">
        <option value="">Все сущности</option>
        {options.entities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </NativeSelect>
      <NativeSelect name="model" defaultValue={filters.model} key={entity} aria-label="Модель">
        <option value="">Все модели</option>
        {models.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </NativeSelect>
      <NativeSelect name="city" defaultValue={filters.city} aria-label="Город">
        <option value="">Все города</option>
        {options.cities.map(city => <option key={city.id} value={city.id}>{cityLabel(city)}</option>)}
      </NativeSelect>
      <Button type="submit" variant="outline">Показать</Button>
    </form>
    <p className="px-4 pt-3 text-[13px] text-muted-foreground" aria-live="polite">{(filtered ? 'Найдено: ' : 'Всего: ') + plural(data.total, 'ТС', 'ТС', 'ТС')}</p>
    {!data.vehicles.length ? (filtered
      ? <Empty icon={Search} title="Ничего не нашли">Измените условия поиска.</Empty>
      : <Empty icon={TrainFront} title="Подвижного состава пока нет" action={create}>ТС — конкретный экземпляр модели в городе, с бортовым номером. К нему привязываются фотографии.</Empty>) : <>
      <Table className="hidden md:table">
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="w-16">ID</TableHead><TableHead>Номер</TableHead><TableHead>Модель</TableHead><TableHead>Город</TableHead>
          <TableHead>Постр.</TableHead><TableHead>Состояние</TableHead><TableHead className="text-right">Фото</TableHead><TableHead className="w-32" />
        </TableRow></TableHeader>
        <TableBody>{data.vehicles.map(vehicle => <TableRow key={vehicle.id}>
          <TableCell className="text-muted-foreground tabular-nums">{vehicle.id}</TableCell>
          <TableCell>
            <Link href={'/admin?type=VehicleEdit&id=' + vehicle.id} className="inline-flex items-center gap-2 font-medium hover:underline">
              {swatch(entities.get(vehicle.entityid)?.color ?? '')}{vehicle.number}</Link>
            {vehicle.factoryNumber && <p className="text-[13px] text-muted-foreground">Зав. № {vehicle.factoryNumber}</p>}
          </TableCell>
          <TableCell className="text-sm">{vehicle.model?.title ?? <span className="text-muted-foreground">—</span>}</TableCell>
          <TableCell className="text-sm">{vehicle.city?.title ?? <span className="text-muted-foreground">—</span>}
            {vehicle.depot && <p className="text-[13px] text-muted-foreground">{vehicle.depot.title}</p>}</TableCell>
          <TableCell className="text-sm tabular-nums">{formatPartialDate(vehicle.built) || '—'}</TableCell>
          <TableCell><Badge variant={statusVariant(vehicle.status)}>{vehicleStatus(vehicle.status).label}</Badge></TableCell>
          <TableCell className="text-right tabular-nums">{vehicle.photos}</TableCell>
          <TableCell>{actions(vehicle)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
      <ul className="divide-y md:hidden">{data.vehicles.map(vehicle => <li key={vehicle.id} className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link href={'/admin?type=VehicleEdit&id=' + vehicle.id} className="block truncate font-medium">№ {vehicle.number}</Link>
          <p className="truncate text-[13px] text-muted-foreground">{[vehicle.model?.title, vehicle.city?.title, vehicleStatus(vehicle.status).label].filter(Boolean).join(' · ')}</p>
        </div>
        {actions(vehicle)}
      </li>)}</ul>
    </>}
    <div className="pb-4"><Pagination page={data.page} pages={data.pages} href={href} /></div>
  </Card>;
}

/** Partial dates come from the API as YYYY[-MM[-DD]] and are edited as ДД.ММ.ГГГГ. */
const shownDate = (value: string | null) => value ? formatPartialDate(value) || value : '';

export function VehicleForm({ options, vehicle, preset }: { options: VehicleOptions; vehicle?: VehicleDetails; preset?: { model?: string; city?: string } }) {
  const presetModel = options.models.find(model => String(model.id) === preset?.model);
  const [entity, setEntity] = useState(vehicle ? String(vehicle.entityid) : presetModel ? String(presetModel.entityid) : options.entities.length === 1 ? String(options.entities[0].id) : '');
  const [form, setForm] = useState({
    title: vehicle?.title ?? '', model_id: vehicle?.model_id ? String(vehicle.model_id) : presetModel ? String(presetModel.id) : '',
    city_id: vehicle?.city_id ? String(vehicle.city_id) : preset?.city ?? '', depot_id: vehicle?.depot_id ? String(vehicle.depot_id) : '',
    factory_number: vehicle?.factory_number ?? '', vin: vehicle?.vin ?? '',
    built: shownDate(vehicle?.built ?? null), started: shownDate(vehicle?.started ?? null), retired: shownDate(vehicle?.retired ?? null), scrapped: shownDate(vehicle?.scrapped ?? null),
    status: String(vehicle?.status ?? 1), purpose: String(vehicle?.purpose ?? 0), comment: vehicle?.comment ?? '',
  });
  const { fields, error } = useEntityFields(entity);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [pending, run] = useAction();
  const values = useMemo(() => ({ ...(fields && vehicle ? savedValues(vehicle.content, fields) : {}), ...edited }), [fields, vehicle, edited]);
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value }));

  const models = options.models.filter(model => String(model.entityid) === entity);
  const depots = options.depots.filter(depot => String(depot.parent_id) === form.city_id);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = { ...(vehicle ? {} : { entityid: entity }), ...form, ...fieldBody(fields, 'vehicle', values) };
    const result = await run(() => vehicle
      ? send('/api/admin/vehicles/' + vehicle.id, { method: 'PATCH', body, fallback: 'Не удалось сохранить ТС. Проверьте поля и даты.' })
      : send<{ id: number }>('/api/admin/vehicles', { body, fallback: 'Не удалось добавить ТС. Проверьте поля и даты.' }),
    { success: vehicle ? 'ТС сохранено' : 'ТС добавлено', refresh: false });
    if (result.ok) navigate('/admin?type=Vehicles' + (form.model_id ? '&model=' + form.model_id : ''), { refresh: true });
  }

  const current = options.entities.find(item => String(item.id) === entity);
  const date = (key: 'built' | 'started' | 'retired' | 'scrapped', label: string) => <Field>
    <Label htmlFor={'vehicle-' + key}>{label}</Label>
    <Input id={'vehicle-' + key} value={form[key]} onChange={set(key)} placeholder={datePlaceholder} pattern="(\d{1,2}\.)?(\d{1,2}\.)?\d{4}" />
  </Field>;

  return <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Экземпляр</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Field><Label htmlFor="vehicle-entity">Сущность</Label>
            <NativeSelect id="vehicle-entity" value={entity} disabled={!!vehicle} required
              onChange={event => { setEntity(event.target.value); setEdited({}); setForm(f => ({ ...f, model_id: '' })); }}>
              <option value="" disabled>Выберите сущность</option>
              {options.entities.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
            </NativeSelect></Field>
          <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <Field><Label htmlFor="vehicle-number">Бортовой №</Label>
              <Input id="vehicle-number" value={form.title} onChange={set('title')} placeholder="5000" maxLength={64} required /></Field>
            <Field><Label htmlFor="vehicle-model">Модель</Label>
              <NativeSelect id="vehicle-model" value={form.model_id} onChange={set('model_id')} disabled={!entity}>
                <option value="">Не указана</option>
                {models.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </NativeSelect></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Label htmlFor="vehicle-city">Город</Label>
              <NativeSelect id="vehicle-city" value={form.city_id} onChange={event => setForm(f => ({ ...f, city_id: event.target.value, depot_id: '' }))}>
                <option value="">Не указан</option>
                {options.cities.map(city => <option key={city.id} value={city.id}>{cityLabel(city)}</option>)}
              </NativeSelect>
              {!options.cities.length && <FieldDescription>Города добавляются в <Link href="/admin?type=GeoDB" className="underline">GeoDB</Link>.</FieldDescription>}</Field>
            <Field><Label htmlFor="vehicle-depot">Депо/Парк</Label>
              <NativeSelect id="vehicle-depot" value={form.depot_id} onChange={set('depot_id')} disabled={!depots.length}>
                <option value="">Не указано</option>
                {depots.map(depot => <option key={depot.id} value={depot.id}>{depot.title}</option>)}
              </NativeSelect></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Label htmlFor="vehicle-factory">Заводской №</Label>
              <Input id="vehicle-factory" value={form.factory_number} onChange={set('factory_number')} maxLength={64} /></Field>
            <Field><Label htmlFor="vehicle-vin">VIN / № шасси</Label>
              <Input id="vehicle-vin" value={form.vin} onChange={set('vin')} maxLength={64} className="font-mono" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Label htmlFor="vehicle-status">Текущее состояние</Label>
              <NativeSelect id="vehicle-status" value={form.status} onChange={set('status')}>
                {vehicleStatuses.map(status => <option key={status.id} value={status.id}>{status.label}</option>)}
              </NativeSelect></Field>
            <Field><Label htmlFor="vehicle-purpose">Назначение</Label>
              <NativeSelect id="vehicle-purpose" value={form.purpose} onChange={set('purpose')}>
                {vehiclePurposes.map(purpose => <option key={purpose.id} value={purpose.id}>{purpose.label}</option>)}
              </NativeSelect></Field>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div>
          <CardTitle>Даты</CardTitle>
          <CardDescription>Можно указать только год или месяц и год.</CardDescription>
        </div></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {date('built', 'Построен')}{date('started', 'Начало работы')}{date('retired', 'Выбытие')}{date('scrapped', 'Утилизация')}
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader><div>
        <CardTitle className="flex items-center gap-2">{current && swatch(current.color)}Дополнительно</CardTitle>
        <CardDescription>{current ? 'Свои поля сущности «' + current.title + '» для ТС.' : 'Выберите сущность, чтобы заполнить её поля.'}</CardDescription>
      </div></CardHeader>
      <CardContent className="grid gap-4">
        {entity && <CustomFields fields={fields} error={error} scope="vehicle" values={values} onChange={(key, value) => setEdited(list => ({ ...list, [key]: value }))} />}
        <Field><Label htmlFor="vehicle-comment">Примечание</Label>
          <Textarea id="vehicle-comment" value={form.comment} onChange={set('comment')} rows={4} /></Field>
        {vehicle && <p className="text-[13px] text-muted-foreground">Фотографий: {vehicle.photos}.</p>}
      </CardContent>
      <CardFooter>
        {vehicle && <Button type="button" variant="ghost" asChild className="mr-auto"><a href={'/vehicle/' + vehicle.id + '/'} target="_blank"><ExternalLink />На сайте</a></Button>}
        <Button type="button" variant="ghost" asChild><Link href="/admin?type=Vehicles">Отмена</Link></Button>
        <Button type="submit" disabled={pending || !fields}>{vehicle ? 'Сохранить' : 'Добавить ТС'}</Button>
      </CardFooter>
    </Card>
  </form>;
}
