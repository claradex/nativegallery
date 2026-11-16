'use client';

import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { formatDate } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Empty } from '../ui/empty';
import { Field, FieldDescription, Label } from '../ui/field';
import { NativeSelect, Textarea } from '../ui/input';
import { Badge } from '../ui/badge';
import { newsKinds } from '@nativegallery/contracts';

export interface NewsItem { id: number; body: string; time: number; kind: number; city_id: number | null }
export interface NewsCity { id: number; title: string }

/** «Сайт» news go to the right column of the home page, «Транспорт» news to «Новости транспорта» with their city. */
function NewsKindPicker({ kind, setKind }: { kind: number; setKind: (kind: number) => void }) {
  return <div className="flex w-fit rounded-md bg-muted p-0.5 text-[13px]" role="radiogroup" aria-label="Тип новости">
    {newsKinds.map(item => <button key={item.id} type="button" role="radio" aria-checked={kind === item.id} onClick={() => setKind(item.id)}
      className={'rounded px-2.5 py-1 transition-colors ' + (kind === item.id ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
      {item.label}</button>)}
  </div>;
}

function NewsDialog({ item, trigger, cities, initialKind = 0 }: { item?: NewsItem; trigger: ReactNode; cities: NewsCity[]; initialKind?: number }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(item?.body ?? '');
  const [preview, setPreview] = useState(false);
  const [kind, setKind] = useState(item?.kind ?? initialKind);
  const [city, setCity] = useState(item?.city_id ? String(item.city_id) : '');
  const [pending, run] = useAction();
  const fields = { body, kind, city_id: kind === 1 ? city : '' };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => item
      ? send('/api/admin/news/' + item.id, { method: 'PATCH', body: fields, fallback: 'Не удалось сохранить новость.' })
      : send('/api/admin/news/create', { body: fields, fallback: 'Не удалось опубликовать новость.' }),
    { success: item ? 'Новость сохранена' : 'Новость опубликована' });
    if (result.ok) { setOpen(false); if (!item) setBody(''); }
  }

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setBody(item?.body ?? body); setPreview(false); setKind(item?.kind ?? initialKind); setCity(item?.city_id ? String(item.city_id) : ''); } }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent wide>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader>
          <DialogTitle>{item ? 'Редактирование новости' : 'Новая новость'}</DialogTitle>
          <DialogDescription>Новость появится на главной странице сайта.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label>Тип</Label>
            <NewsKindPicker kind={kind} setKind={setKind} />
            <FieldDescription>{kind === 1 ? 'Блок «Новости транспорта» на главной.' : 'Блок «Новости сайта» на главной.'}</FieldDescription>
          </Field>
          {kind === 1 && <Field>
            <Label htmlFor="news-city">Город</Label>
            <NativeSelect id="news-city" value={city} onChange={event => setCity(event.target.value)}>
              <option value="">Без города</option>
              {cities.map(option => <option key={option.id} value={option.id}>{option.title}</option>)}
            </NativeSelect>
            {!cities.length && <FieldDescription>Города добавляются в разделе GeoDB.</FieldDescription>}
          </Field>}
        </div>
        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="news-body">Текст</Label>
            <div className="flex rounded-md bg-muted p-0.5 text-[13px]">
              {[false, true].map(mode => <button key={String(mode)} type="button" onClick={() => setPreview(mode)}
                className={'rounded px-2.5 py-1 transition-colors ' + (preview === mode ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
                {mode ? 'Просмотр' : 'Код'}</button>)}
            </div>
          </div>
          {preview
            ? <div className="admin-prose min-h-48 rounded-md border bg-card px-3 py-2" dangerouslySetInnerHTML={{ __html: body || '<p>Пусто</p>' }} />
            : <Textarea id="news-body" value={body} onChange={event => setBody(event.target.value)} rows={10} required className="font-mono text-[13px]" />}
          <FieldDescription>Можно использовать HTML: ссылки, списки, изображения. Опасные теги сервер вырежет.</FieldDescription>
        </Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="submit" disabled={pending || !body.trim()}>{item ? 'Сохранить' : 'Опубликовать'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

export function CreateNews({ cities, kind }: { cities: NewsCity[]; kind?: number }) {
  return <NewsDialog cities={cities} initialKind={kind} trigger={<Button><Plus />Новость</Button>} />;
}

export function NewsList({ items: all, cities }: { items: NewsItem[]; cities: NewsCity[] }) {
  const [pending, run] = useAction();
  const [filter, setFilter] = useState<number | null>(null);
  const items = filter === null ? all : all.filter(item => item.kind === filter);
  const cityTitle = new Map(cities.map(city => [city.id, city.title]));
  const tabs = <div className="mb-4 flex w-fit rounded-md bg-muted p-0.5 text-[13px]">
    {[{ id: null, label: 'Все' }, ...newsKinds].map(item => {
      const count = item.id === null ? all.length : all.filter(news => news.kind === item.id).length;
      return <button key={String(item.id)} type="button" onClick={() => setFilter(item.id)}
        className={'rounded px-3 py-1 transition-colors ' + (filter === item.id ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
        {item.label} <span className="text-muted-foreground">{count}</span></button>;
    })}
  </div>;
  if (!items.length) return <>{tabs}<Card><Empty icon={Newspaper} title="Новостей пока нет" action={<CreateNews cities={cities} kind={filter ?? 0} />}>Расскажите посетителям, что нового на сайте и в транспорте.</Empty></Card></>;
  return <>{tabs}<ol className="grid gap-4">{items.map(item => <li key={item.id}>
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.kind === 1 ? 'info' : 'secondary'}>{newsKinds.find(kind => kind.id === item.kind)?.label ?? 'Сайт'}</Badge>
          {item.kind === 1 && item.city_id && <span className="text-[13px] font-medium">{cityTitle.get(item.city_id) ?? 'Город № ' + item.city_id}</span>}
          <time className="text-[13px] text-muted-foreground">{formatDate(item.time)}</time>
        </div>
        <div className="flex gap-1">
          <NewsDialog item={item} cities={cities} trigger={<Button size="sm" variant="ghost"><Pencil />Изменить</Button>} />
          <Confirm title="Удалить новость?" description="Она пропадёт с главной страницы. Это действие нельзя отменить."
            onConfirm={() => run(() => send('/api/admin/news/' + item.id + '/delete', { fallback: 'Не удалось удалить новость.' }), { success: 'Новость удалена' })}
            trigger={<Button size="sm" variant="ghost-destructive" disabled={pending}><Trash2 />Удалить</Button>} />
        </div>
      </div>
      <div className="admin-prose px-5 py-4" dangerouslySetInnerHTML={{ __html: item.body }} />
    </Card>
  </li>)}</ol></>;
}
