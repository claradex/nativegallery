'use client';

import { CalendarClock, Camera, CheckCircle2, ExternalLink, FolderOpen, Inbox, MapPin, UserRound, XCircle } from 'lucide-react';
import { useState } from 'react';
import Link from '../../../components/Link';
import { formatDate, plural } from '../lib/format';
import { useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Empty } from '../ui/empty';
import { Field, Label } from '../ui/field';
import { NativeSelect, Textarea } from '../ui/input';
import { DecisionDialog, Ratings } from './DecisionDialog';
import { decide, publishKinds, type PendingPhoto } from './decisions';
import { PhotoThumb } from './PhotoMedia';

function QueueItem({ photo, galleries }: { photo: PendingPhoto; galleries: Record<number, string> }) {
  const [reason, setReason] = useState('0');
  const [irate, setIrate] = useState('1');
  const [krate, setKrate] = useState('1');
  const [comment, setComment] = useState('');
  const [pending, run] = useAction();

  return <Card className="overflow-hidden p-0">
    <article className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <a href={'/photo/' + photo.id} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] bg-muted lg:aspect-auto lg:min-h-80">
        <PhotoThumb url={photo.photourl} className="absolute inset-0 object-contain" />
        <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">№ {photo.id}</span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Открыть<ExternalLink className="size-3" />
        </span>
      </a>
      <div className="flex flex-col gap-5 p-5">
        <div className="grid gap-2">
          <h2 className="flex items-start gap-2 text-base leading-snug font-semibold">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{photo.place || 'Место не указано'}
          </h2>
          <ul className="grid gap-1 text-[13px] text-muted-foreground">
            <li className="flex items-center gap-2"><UserRound className="size-3.5" />
              <Link href={'/author/' + photo.user_id} className="text-foreground hover:underline">{photo.username || 'Автор ' + photo.user_id}</Link></li>
            <li className="flex items-center gap-2"><CalendarClock className="size-3.5" />Загружено {formatDate(photo.timeupload)}</li>
            {photo.posted_at > 0 && <li className="flex items-center gap-2"><Camera className="size-3.5" />Снято {formatDate(photo.posted_at, { time: false })}</li>}
            {photo.gallery_id > 0 && <li className="flex items-center gap-2"><FolderOpen className="size-3.5" />{galleries[photo.gallery_id] ?? 'Галерея ' + photo.gallery_id}</li>}
          </ul>
          {photo.postbody && <p className="line-clamp-4 text-sm whitespace-pre-line">{photo.postbody}</p>}
        </div>
        <div className="mt-auto grid gap-4 rounded-lg border bg-muted/40 p-4">
          <Field>
            <Label htmlFor={'kind' + photo.id}>Вид публикации</Label>
            <NativeSelect id={'kind' + photo.id} value={reason} onChange={event => setReason(event.target.value)}>
              {publishKinds.map((label, index) => <option key={label} value={index}>{label}</option>)}
            </NativeSelect>
          </Field>
          <Ratings irate={irate} krate={krate} setIrate={setIrate} setKrate={setKrate} />
          <Field>
            <Label htmlFor={'note' + photo.id}>Комментарий автору</Label>
            <Textarea id={'note' + photo.id} rows={2} value={comment} onChange={event => setComment(event.target.value)} maxLength={4000} placeholder="Необязательно" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button variant="success" className="flex-1" disabled={pending}
              onClick={() => run(() => decide(photo.id, 1, { reason, irate, krate, comment }), { success: 'Фотография № ' + photo.id + ' опубликована' })}>
              <CheckCircle2 />Опубликовать
            </Button>
            <DecisionDialog id={photo.id} mode="decline"
              trigger={<Button variant="outline" className="flex-1 text-destructive hover:text-destructive" disabled={pending}><XCircle />Отклонить…</Button>} />
          </div>
        </div>
      </div>
    </article>
  </Card>;
}

export function ModerationQueue({ photos, galleries }: { photos: PendingPhoto[]; galleries: Record<number, string> }) {
  if (!photos.length) return <Card><Empty icon={Inbox} title="Очередь пуста">Новые фотографии появятся здесь, как только их загрузят.</Empty></Card>;
  return <div className="grid gap-4">
    <p className="text-[13px] text-muted-foreground" aria-live="polite">{plural(photos.length, 'фотография ждёт', 'фотографии ждут', 'фотографий ждут')} решения, новые сверху.</p>
    {photos.map(photo => <QueueItem key={photo.id} photo={photo} galleries={galleries} />)}
  </div>;
}
