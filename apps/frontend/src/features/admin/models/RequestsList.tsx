'use client';

import { Check, Inbox, X } from 'lucide-react';
import Link from '../../../components/Link';
import { formatDate } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Empty } from '../ui/empty';

export interface VehicleRequest {
  id: number; title: string; model: string; color: string; status: number; userId: number; username: string; createdAt: number;
  fields: { label: string; value: string }[];
}

function RequestCard({ request }: { request: VehicleRequest }) {
  const [pending, run] = useAction();
  const decide = (action: 'accept' | 'decline') => run(() => send('/api/admin/models/requests/' + request.id + '/' + action,
    { fallback: 'Не удалось обработать заявку.' }), { success: action === 'accept' ? 'Модель «' + request.title + '» добавлена в базу' : 'Заявка отклонена' });
  const filled = request.fields.filter(field => field.value.trim());
  return <Card className="flex flex-col">
    <div className="flex items-start justify-between gap-3 px-5 pt-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: request.color || 'var(--muted-foreground)' }} />{request.model || 'Сущность удалена'}
        </p>
        <h2 className="mt-1 text-base font-semibold">{request.title}</h2>
      </div>
      {request.status === 1 && <Badge variant="success">Принята</Badge>}
      {request.status === 2 && <Badge variant="destructive">Отклонена</Badge>}
    </div>
    <dl className="grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 px-5 py-4 text-sm">
      {filled.length ? filled.map((field, index) => <div key={index} className="contents">
        <dt className="text-muted-foreground">{field.label}</dt><dd className="break-words">{field.value}</dd>
      </div>) : <p className="col-span-2 text-muted-foreground">Поля не заполнены.</p>}
    </dl>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
      <p className="text-[13px] text-muted-foreground">
        {request.username ? <Link href={'/author/' + request.userId} className="text-foreground hover:underline">{request.username}</Link> : 'Автор ' + request.userId}
        {request.createdAt > 0 && <>, {formatDate(request.createdAt)}</>}
      </p>
      {request.status === 0 && <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={pending} onClick={() => decide('decline')}><X />Отклонить</Button>
        <Button size="sm" variant="success" disabled={pending} onClick={() => decide('accept')}><Check />Принять</Button>
      </div>}
    </div>
  </Card>;
}

export function RequestsList({ requests, status }: { requests: VehicleRequest[]; status: number }) {
  if (!requests.length) return <Card><Empty icon={Inbox} title={status === 0 ? 'Новых заявок нет' : 'Здесь пока пусто'}>
    {status === 0 ? 'Пользователи предлагают модели со страницы загрузки фотографий.' : undefined}</Empty></Card>;
  return <ul className="grid gap-4 md:grid-cols-2">{requests.map(request => <li key={request.id} className="grid"><RequestCard request={request} /></li>)}</ul>;
}
