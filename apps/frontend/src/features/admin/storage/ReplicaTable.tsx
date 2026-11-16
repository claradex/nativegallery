'use client';

import { CloudUpload, FileCheck2, ShieldCheck } from 'lucide-react';
import { replicaStatusLabels, type ReplicaStatus, type StorageReplicaData } from '@nativegallery/contracts';
import Link from '../../../components/Link';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Empty } from '../ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { isoDate } from './StorageList';

const variants: Record<ReplicaStatus, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'secondary', published: 'success', failed: 'destructive', missing: 'destructive', mismatch: 'warning',
};

function size(bytes: number | null) {
  if (bytes === null) return '—';
  if (bytes < 1024) return bytes + ' Б';
  const units = ['КБ', 'МБ', 'ГБ'];
  let value = bytes / 1024, unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' ' + units[unit];
}

const emptyTitles: Record<string, string> = {
  problems: 'Проблем нет', pending: 'Очередь пуста', published: 'Опубликованных файлов нет', all: 'Файлов нет',
};

/** Files of one storage: their state, the last check and per-photo re-upload or re-check. */
export function ReplicaTable({ targetId, enabled, replicas, filter }: {
  targetId: number; enabled: boolean; replicas: StorageReplicaData[]; filter: ReplicaStatus | 'problems' | 'all';
}) {
  const [pending, run] = useAction();
  const url = '/api/admin/storage/' + targetId;
  if (!replicas.length) {
    return <Card><Empty icon={FileCheck2} title={emptyTitles[filter] ?? 'Файлов нет'}>
      {filter === 'problems' ? 'Все проверенные файлы на месте и совпадают с оригиналами.' : 'Здесь появятся файлы, когда фотографии будут опубликованы.'}
    </Empty></Card>;
  }
  return <Card className="overflow-hidden p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Фото</TableHead>
          <TableHead>Файл</TableHead>
          <TableHead>Состояние</TableHead>
          <TableHead className="text-right">Размер</TableHead>
          <TableHead>Опубликован</TableHead>
          <TableHead>Проверен</TableHead>
          <TableHead className="w-0"><span className="sr-only">Действия</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {replicas.map(replica => <TableRow key={replica.id}>
          <TableCell><Link href={'/photo/' + replica.photoId} className="font-medium tabular-nums hover:underline">№{replica.photoId}</Link></TableCell>
          <TableCell className="max-w-72">
            <span className="block truncate font-mono text-xs" title={replica.file}>{replica.file}</span>
            {replica.error && <span className="mt-1 block text-xs break-words text-destructive">{replica.error}</span>}
          </TableCell>
          <TableCell><Badge variant={variants[replica.status]}>{replicaStatusLabels[replica.status]}</Badge></TableCell>
          <TableCell className="text-right whitespace-nowrap tabular-nums">{size(replica.size)}</TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">{isoDate(replica.publishedAt)}</TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">{isoDate(replica.checkedAt)}</TableCell>
          <TableCell>
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" disabled={pending || !enabled} title="Загрузить файлы фотографии заново"
                onClick={() => run(() => send(url + '/publish', { body: { photo: replica.photoId }, fallback: 'Не удалось поставить в очередь.' }),
                  { success: 'Фото №' + replica.photoId + ' будет загружено заново' })}>
                <CloudUpload />Перезалить</Button>
              <Button variant="ghost" size="sm" disabled={pending} title="Сверить файлы фотографии с оригиналами"
                onClick={() => run(() => send(url + '/verify', { body: { photo: replica.photoId, deep: true }, fallback: 'Не удалось запустить проверку.' }),
                  { success: 'Проверка фото №' + replica.photoId + ' поставлена в очередь' })}>
                <ShieldCheck />Проверить</Button>
            </div>
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
  </Card>;
}
