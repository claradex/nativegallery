'use client';

import { CheckCircle2, ImageOff, RotateCcw, XCircle } from 'lucide-react';
import Link from '../../../components/Link';
import { formatDate } from '../lib/format';
import { useAction } from '../lib/request';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Empty } from '../ui/empty';
import { DecisionDialog } from './DecisionDialog';
import { decide, type PendingPhoto } from './decisions';
import { PhotoThumb } from './PhotoMedia';

function Requeue({ id }: { id: number }) {
  const [pending, run] = useAction();
  return <AlertDialog>
    <AlertDialogTrigger asChild><Button size="sm" variant="ghost" disabled={pending}><RotateCcw />В очередь</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Вернуть фотографию № {id} на модерацию?</AlertDialogTitle>
        <AlertDialogDescription>Она пропадёт с сайта и снова появится в очереди.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => run(() => decide(id, 0), { success: 'Фотография возвращена в очередь' })}>Вернуть</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}

export function PhotoArchive({ photos, status, query }: { photos: PendingPhoto[]; status: 1 | 2; query: string }) {
  if (!photos.length) return <Card><Empty icon={ImageOff} title={query ? 'Ничего не нашли' : status === 1 ? 'Опубликованных фотографий нет' : 'Отклонённых фотографий нет'}>
    {query ? 'Поиск идёт по номеру, месту и описанию.' : undefined}
  </Empty></Card>;
  return <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.map(photo => <li key={photo.id}>
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <a href={'/photo/' + photo.id} target="_blank" rel="noreferrer" className="relative block aspect-[3/2] bg-muted">
        <PhotoThumb url={photo.photourl} className="absolute inset-0" />
        <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">№ {photo.id}</span>
      </a>
      <div className="grid flex-1 gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium">{photo.place || 'Место не указано'}</p>
        <p className="text-[13px] text-muted-foreground">
          <Link href={'/author/' + photo.user_id} className="hover:text-foreground hover:underline">{photo.username || 'Автор ' + photo.user_id}</Link>, {status === 1 ? 'опубликовано' : 'отклонено'} {formatDate(photo.timeupload, { time: false })}
        </p>
      </div>
      <div className="flex items-center gap-1 border-t px-2 py-1.5">
        {status === 1
          ? <DecisionDialog id={photo.id} mode="decline"
            trigger={<Button size="sm" variant="ghost-destructive"><XCircle />Отклонить</Button>} />
          : <DecisionDialog id={photo.id} mode="accept"
            trigger={<Button size="sm" variant="ghost" className="text-success hover:text-success"><CheckCircle2 />Опубликовать</Button>} />}
        <Requeue id={photo.id} />
      </div>
    </Card>
  </li>)}</ul>;
}
