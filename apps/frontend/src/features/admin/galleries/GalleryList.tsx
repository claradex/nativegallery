'use client';

import { Check, ExternalLink, FolderPlus, Images, Pencil, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Link from '../../../components/Link';
import { plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Empty } from '../ui/empty';
import { Field, Label } from '../ui/field';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

export interface Gallery { id: number; title: string; opened: number; photos: number }

function save(id: number | null, title: string, opened: boolean) {
  return send('/api/admin/galleries' + (id ? '/' + id : ''), { body: { title, opened: opened ? '1' : undefined }, fallback: 'Не удалось сохранить галерею.' });
}

function GalleryRow({ gallery }: { gallery: Gallery }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(gallery.title);
  const [opened, setOpened] = useState(gallery.opened === 1);
  const [pending, run] = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if ((await run(() => save(gallery.id, title.trim(), opened), { success: 'Галерея сохранена' })).ok) setEditing(false);
  }
  async function toggle(value: boolean) {
    setOpened(value);
    const result = await run(() => save(gallery.id, gallery.title, value), { success: value ? 'Галерея открыта для загрузки' : 'Галерея закрыта для загрузки' });
    if (!result.ok) setOpened(!value);
  }

  if (editing) return <li className="px-5 py-3">
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input value={title} onChange={event => setTitle(event.target.value)} maxLength={255} required autoFocus aria-label="Название галереи" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !title.trim()}><Check />Сохранить</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(gallery.title); }}><X />Отмена</Button>
      </div>
    </form>
  </li>;

  return <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
    <div className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground"><Images className="size-4" /></div>
    <div className="min-w-0 flex-1 basis-40">
      <p className="flex items-center gap-2 font-medium"><span className="truncate">{gallery.title}</span>
        {!opened && <Badge variant="secondary">Закрыта</Badge>}</p>
      <p className="text-[13px] text-muted-foreground">№ {gallery.id}, {plural(gallery.photos, 'фотография', 'фотографии', 'фотографий')}</p>
    </div>
    <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Switch checked={opened} onCheckedChange={toggle} disabled={pending} aria-label={'Загрузка в галерею «' + gallery.title + '»'} />
      <span className="hidden sm:inline">Загрузка</span>
    </label>
    <div className="flex gap-1">
      <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Переименовать"><Pencil /></Button>
      <Button size="icon-sm" variant="ghost" asChild><Link href={'/article/' + gallery.id} aria-label="Открыть на сайте" target="_blank"><ExternalLink /></Link></Button>
    </div>
  </li>;
}

export function GalleryList({ galleries }: { galleries: Gallery[] }) {
  const [title, setTitle] = useState('');
  const [opened, setOpened] = useState(true);
  const [pending, run] = useAction();

  async function create(event: FormEvent) {
    event.preventDefault();
    if ((await run(() => save(null, title.trim(), opened), { success: 'Галерея создана' })).ok) setTitle('');
  }

  return <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <Card>
      <CardHeader><div><CardTitle>Все галереи</CardTitle><CardDescription>Закрытые галереи не предлагаются при загрузке фотографий.</CardDescription></div></CardHeader>
      {galleries.length
        ? <ul className="divide-y">{galleries.map(gallery => <GalleryRow key={gallery.id} gallery={gallery} />)}</ul>
        : <Empty icon={Images} title="Галерей пока нет">Создайте первую в форме «Новая галерея».</Empty>}
    </Card>
    <Card className="xl:sticky xl:top-6">
      <CardHeader><CardTitle>Новая галерея</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={create} className="grid gap-4">
          <Field><Label htmlFor="gallery-title">Название</Label>
            <Input id="gallery-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={255} required /></Field>
          <label className="flex items-center justify-between gap-3 text-sm">Доступна при загрузке
            <Switch checked={opened} onCheckedChange={setOpened} /></label>
          <Button type="submit" disabled={pending || !title.trim()}><FolderPlus />Создать</Button>
        </form>
      </CardContent>
    </Card>
  </div>;
}
