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
import { Textarea } from '../ui/input';

export interface NewsItem { id: number; body: string; time: number }

function NewsDialog({ item, trigger }: { item?: NewsItem; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(item?.body ?? '');
  const [preview, setPreview] = useState(false);
  const [pending, run] = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => item
      ? send('/api/admin/news/' + item.id, { method: 'PATCH', body: { body }, fallback: 'Не удалось сохранить новость.' })
      : send('/api/admin/news/create', { body: { body }, fallback: 'Не удалось опубликовать новость.' }),
    { success: item ? 'Новость сохранена' : 'Новость опубликована' });
    if (result.ok) { setOpen(false); if (!item) setBody(''); }
  }

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setBody(item?.body ?? body); setPreview(false); } }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent wide>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader>
          <DialogTitle>{item ? 'Редактирование новости' : 'Новая новость'}</DialogTitle>
          <DialogDescription>Новость появится на главной странице сайта.</DialogDescription>
        </DialogHeader>
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

export function CreateNews() {
  return <NewsDialog trigger={<Button><Plus />Новость</Button>} />;
}

export function NewsList({ items }: { items: NewsItem[] }) {
  const [pending, run] = useAction();
  if (!items.length) return <Card><Empty icon={Newspaper} title="Новостей пока нет" action={<CreateNews />}>Расскажите посетителям, что нового на сайте.</Empty></Card>;
  return <ol className="grid gap-4">{items.map(item => <li key={item.id}>
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-2">
        <time className="text-[13px] text-muted-foreground">{formatDate(item.time)}</time>
        <div className="flex gap-1">
          <NewsDialog item={item} trigger={<Button size="sm" variant="ghost"><Pencil />Изменить</Button>} />
          <Confirm title="Удалить новость?" description="Она пропадёт с главной страницы. Это действие нельзя отменить."
            onConfirm={() => run(() => send('/api/admin/news/' + item.id + '/delete', { fallback: 'Не удалось удалить новость.' }), { success: 'Новость удалена' })}
            trigger={<Button size="sm" variant="ghost-destructive" disabled={pending}><Trash2 />Удалить</Button>} />
        </div>
      </div>
      <div className="admin-prose px-5 py-4" dangerouslySetInnerHTML={{ __html: item.body }} />
    </Card>
  </li>)}</ol>;
}
