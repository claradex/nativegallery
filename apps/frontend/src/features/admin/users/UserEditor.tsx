'use client';

import { ExternalLink, Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Link from '../../../components/Link';
import { formatDate } from '../lib/format';
import { send, useAction } from '../lib/request';
import { roleNames } from '../lib/roles';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Field, FieldDescription, Label } from '../ui/field';
import { RadioGroup, RadioTile } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import type { UserRow } from './UsersTable';

export interface UserDetails extends UserRow {
  canChangeAccess: boolean; pending: number; comments: number;
}

const roleHints: Record<number, string> = {
  0: 'Обычный участник сайта.',
  1: 'Полный доступ ко всем разделам панели.',
  2: 'Только очередь модерации фотографий.',
  3: 'Модерация, новости, конкурсы и каталог моделей; без пользователей, страниц и галерей.',
};

export function UserEditor({ user, origin }: { user: UserDetails; origin: string }) {
  const [directUpload, setDirectUpload] = useState(user.directUpload);
  const [blocked, setBlocked] = useState(user.status === 1);
  const [role, setRole] = useState(String(user.admin));
  const [pending, run] = useAction();
  const online = user.online >= Date.now() / 1000 - 300;
  // The API only knows statuses 0 and 1; another legacy value stays untouched unless the switch is used.
  const [statusTouched, setStatusTouched] = useState(false);
  const unknownStatus = ![0, 1].includes(user.status);

  function save(event: FormEvent) {
    event.preventDefault();
    const body: Record<string, string> = { premoderation: String(directUpload) };
    if (user.canChangeAccess) {
      body.admin = role;
      if (!unknownStatus || statusTouched) body.accountstatus = blocked ? '1' : '0';
    }
    run(() => send('/api/admin/users/' + user.id, { method: 'PATCH', body }), { success: 'Изменения сохранены' });
  }

  return <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
    <form onSubmit={save} className="order-2 xl:order-1">
      <Card>
        <CardHeader><div><CardTitle>Доступ и права</CardTitle><CardDescription>Изменения вступают в силу сразу после сохранения.</CardDescription></div></CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <Label htmlFor="direct-upload">Прямая загрузка</Label>
              <FieldDescription>Фотографии публикуются сразу, без очереди модерации.</FieldDescription>
            </div>
            <Switch id="direct-upload" checked={directUpload} onCheckedChange={setDirectUpload} />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <Label htmlFor="blocked">Заблокировать аккаунт</Label>
              <FieldDescription>
                {unknownStatus && !statusTouched ? 'Сейчас у аккаунта особый статус (' + user.status + '); он сохранится, пока вы не измените переключатель.'
                  : 'Пользователь не сможет войти; открытые сессии завершатся.'}
              </FieldDescription>
            </div>
            <Switch id="blocked" checked={blocked} disabled={!user.canChangeAccess}
              onCheckedChange={value => { setBlocked(value); setStatusTouched(true); }} />
          </div>
          <Field>
            <Label id="role-label">Роль</Label>
            <RadioGroup value={role} onValueChange={setRole} aria-labelledby="role-label" disabled={!user.canChangeAccess} className="sm:grid-cols-2">
              {[0, 3, 2, 1].map(value => <RadioTile key={value} value={String(value)} className="items-start py-2.5">
                <span className="block font-medium">{roleNames[value]}</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{roleHints[value]}</span>
              </RadioTile>)}
            </RadioGroup>
            {!user.canChangeAccess && <FieldDescription className="flex items-center gap-1.5"><Lock className="size-3.5" />Свою роль и блокировку изменить нельзя.</FieldDescription>}
          </Field>
        </CardContent>
        <CardFooter><Button type="submit" disabled={pending}>{pending ? 'Сохраняем…' : 'Сохранить изменения'}</Button></CardFooter>
      </Card>
    </form>
    <Card className="order-1 xl:order-2">
      <CardContent className="grid gap-4 py-5">
        <div className="flex items-center gap-3">
          <Avatar src={user.photourl} name={user.username} className="size-14 text-lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.username}</p>
            <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {user.admin !== 0 && <Badge variant="info">{roleNames[user.admin] ?? 'Роль ' + user.admin}</Badge>}
          {user.status === 1 && <Badge variant="destructive">Заблокирован</Badge>}
          {online ? <Badge variant="success">В сети</Badge> : <Badge variant="outline">Был в сети {formatDate(user.online)}</Badge>}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[['Фото', user.photos], ['На модерации', user.pending], ['Комментарии', user.comments]].map(([label, value]) =>
            <div key={label} className="rounded-lg bg-muted px-2 py-2.5">
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>)}
        </dl>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={'/author/' + user.id}><ExternalLink />Профиль на сайте</Link>
        </Button>
        <p className="truncate text-center text-xs text-muted-foreground">{origin}/author/{user.id}</p>
      </CardContent>
    </Card>
  </div>;
}
