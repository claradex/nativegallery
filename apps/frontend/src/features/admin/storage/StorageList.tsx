'use client';

import { CircleAlert, CloudUpload, FolderOpen, HardDrive, Loader2, Plug, ScanSearch, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { replicaStatusLabels, storageKindById, storagePublishModes, type StorageOverview, type StorageTargetData, type StorageTestResult } from '@nativegallery/contracts';
import Link from '../../../components/Link';
import { formatDate, plural } from '../lib/format';
import { send, useAction } from '../lib/request';
import { cn } from '../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Confirm } from '../ui/confirm';
import { Empty } from '../ui/empty';
import { Switch } from '../ui/switch';
import { KindIcon } from './KindIcon';
import { StorageEditor } from './StorageEditor';

/** ISO timestamps from the storage API in the site's date format. */
export function isoDate(value: string | null | undefined) {
  return value ? formatDate(Math.floor(Date.parse(value) / 1000)) : '—';
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'danger' | 'muted' }) {
  return <div className="grid gap-0.5">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={cn('text-lg font-semibold tabular-nums', tone === 'danger' && 'text-destructive', tone === 'muted' && 'text-muted-foreground')}>{value}</dd>
    {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
  </div>;
}

function StorageCard({ target }: { target: StorageTargetData }) {
  const [pending, run] = useAction();
  const [testing, setTesting] = useState(false);
  const kind = storageKindById.get(target.kind);
  const problems = target.files.failed + target.files.missing + target.files.mismatch;
  const coverage = target.photos.eligible ? Math.floor(target.photos.published / target.photos.eligible * 1000) / 10 : 100;
  const files = Object.values(target.files).reduce((sum, count) => sum + count, 0);
  const url = '/api/admin/storage/' + target.id;
  const link = (status: string) => '/admin?' + new URLSearchParams({ type: 'Storage', id: String(target.id), status });

  async function test() {
    setTesting(true);
    try {
      // Without `config` the API tests the saved settings as they are.
      const result = await send<StorageTestResult>('/api/admin/storage/test', {
        body: { id: target.id }, fallback: 'Не удалось проверить подключение.',
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось проверить подключение.');
    } finally {
      setTesting(false);
    }
  }

  const verify = (deep: boolean) => run(() => send(url + '/verify', { body: { deep }, fallback: 'Не удалось запустить проверку.' }),
    { success: deep ? 'Полная проверка поставлена в очередь' : 'Проверка поставлена в очередь' });
  const publish = () => run(async () => {
    const reply = await send<{ queued: number }>(url + '/publish', { fallback: 'Не удалось поставить файлы в очередь.' });
    toast.success(reply.queued ? 'В очереди ' + plural(reply.queued, 'фотография', 'фотографии', 'фотографий') : 'Всё уже опубликовано');
  });

  return <Card className={cn(!target.enabled && 'opacity-80')}>
    <CardHeader className="flex flex-row items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><KindIcon kind={target.kind} className="size-5" /></div>
        <div className="grid min-w-0 gap-1">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Link href={link('problems')} className="truncate hover:underline">{target.title}</Link>
            {!target.enabled && <Badge variant="secondary">Выключено</Badge>}
            {problems > 0 && <Badge variant="destructive"><CircleAlert />{plural(problems, 'проблема', 'проблемы', 'проблем')}</Badge>}
          </CardTitle>
          <CardDescription>
            {kind?.label} · {storagePublishModes.find(mode => mode.id === target.mode)?.label.toLowerCase()}
            {target.queued > 0 && <> · <span className="text-foreground">{plural(target.queued, 'задача', 'задачи', 'задач')} в очереди</span></>}
          </CardDescription>
        </div>
      </div>
      <Switch checked={target.enabled} disabled={pending} aria-label="Публиковать в это хранилище"
        onCheckedChange={enabled => run(() => send(url, { method: 'PUT', body: { enabled }, fallback: 'Не удалось сохранить хранилище.' }),
          { success: enabled ? 'Публикация включена' : 'Публикация выключена' })} />
    </CardHeader>
    <CardContent className="grid gap-4">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Фотографий" value={target.photos.published.toLocaleString('ru-RU') + ' из ' + target.photos.eligible.toLocaleString('ru-RU')} hint={coverage + '%'} />
        <Stat label="Файлов опубликовано" value={target.files.published.toLocaleString('ru-RU')} hint={'всего ' + files.toLocaleString('ru-RU')} />
        <Stat label={replicaStatusLabels.pending} value={target.files.pending.toLocaleString('ru-RU')} tone={target.files.pending ? undefined : 'muted'} />
        <Stat label="С проблемами" value={problems.toLocaleString('ru-RU')} tone={problems ? 'danger' : 'muted'}
          hint={problems ? [
            target.files.failed && replicaStatusLabels.failed.toLowerCase() + ': ' + target.files.failed,
            target.files.missing && replicaStatusLabels.missing.toLowerCase() + ': ' + target.files.missing,
            target.files.mismatch && replicaStatusLabels.mismatch.toLowerCase() + ': ' + target.files.mismatch,
          ].filter(Boolean).join(', ') : undefined} />
      </dl>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={coverage} aria-valuemin={0} aria-valuemax={100} aria-label="Опубликовано фотографий">
        <div className={cn('h-full rounded-full', problems ? 'bg-warning' : 'bg-success')} style={{ width: coverage + '%' }} />
      </div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        <ShieldCheck className="size-4" />
        {target.lastCheck
          ? <>Проверено {isoDate(target.lastCheck.at)}{target.lastCheck.deep ? ' (полная, с загрузкой файлов)' : ''}: {plural(target.lastCheck.checked, 'файл', 'файла', 'файлов')}
            {target.lastCheck.problems ? <span className="text-destructive">, проблем: {target.lastCheck.problems}</span> : ', всё на месте'}</>
          : 'Ещё не проверялось'}
      </p>
      {target.lastCheck?.error && <p className="rounded-md bg-destructive/8 px-3 py-2 text-[13px] break-words text-destructive">{target.lastCheck.error}</p>}
    </CardContent>
    <CardFooter className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" asChild><Link href={link(problems ? 'problems' : 'all')}><FolderOpen />Файлы</Link></Button>
      <Button variant="outline" size="sm" onClick={test} disabled={testing}>{testing ? <Loader2 className="animate-spin" /> : <Plug />}Подключение</Button>
      <Button variant="outline" size="sm" onClick={() => verify(false)} disabled={pending} title="Сверяет размер и контрольные суммы, которые сообщает хранилище">
        <ShieldCheck />Проверить</Button>
      <Button variant="outline" size="sm" onClick={() => verify(true)} disabled={pending} title="Скачивает каждый файл и сравнивает SHA-256 с оригиналом">
        <ScanSearch />Полная проверка</Button>
      <Button variant="outline" size="sm" onClick={publish} disabled={pending || !target.enabled}><CloudUpload />Опубликовать недостающие</Button>
      <div className="ml-auto flex gap-2">
        <StorageEditor target={target} />
        <Confirm title={'Удалить хранилище «' + target.title + '»?'}
          description="Сведения о публикациях и очередь задач будут удалены. Файлы в самом хранилище останутся."
          trigger={<Button variant="ghost-destructive" size="sm" disabled={pending}><Trash2 />Удалить</Button>}
          onConfirm={() => void run(() => send(url, { method: 'DELETE', fallback: 'Не удалось удалить хранилище.' }), { success: 'Хранилище удалено' })} />
      </div>
    </CardFooter>
  </Card>;
}

export function StorageList({ overview }: { overview: StorageOverview }) {
  if (!overview.targets.length) {
    return <Card>
      <Empty icon={HardDrive} title="Внешних хранилищ пока нет" action={<StorageEditor />}>
        Добавьте другой диск, Google Drive, S3 или WebDAV — новые фотографии и видео будут копироваться туда автоматически,
        а уже загруженные можно опубликовать одной кнопкой.
      </Empty>
    </Card>;
  }
  return <div className="grid gap-4">
    {overview.targets.map(target => <StorageCard key={target.id} target={target} />)}
    <p className="text-xs text-muted-foreground">Оригиналы читаются из <code className="rounded bg-muted px-1 py-0.5">{overview.mediaRoot}</code>.
      Расписание проверок — в настройках, раздел «Внешние хранилища».</p>
  </div>;
}
