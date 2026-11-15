'use client';

import { Search, Users } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import Link from '../../../components/Link';
import { navigate } from '../../../components/navigation';
import { formatDate, plural } from '../lib/format';
import { roleNames } from '../lib/roles';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Empty } from '../ui/empty';
import { Input, NativeSelect } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface UserRow {
  id: number; username: string; email: string; photourl: string; admin: number; status: number; online: number;
  directUpload: boolean; photos: number;
}

const filters = {
  all: { label: 'Все', test: () => true },
  staff: { label: 'Команда сайта', test: (user: UserRow) => user.admin !== 0 },
  blocked: { label: 'Заблокированные', test: (user: UserRow) => user.status === 1 },
  direct: { label: 'С прямой загрузкой', test: (user: UserRow) => user.directUpload },
} satisfies Record<string, { label: string; test: (user: UserRow) => boolean }>;

const online = (user: UserRow) => user.online >= Date.now() / 1000 - 300;

export function RoleBadge({ admin }: { admin: number }) {
  if (!admin) return null;
  return <Badge variant={admin === 1 ? 'info' : 'secondary'}>{roleNames[admin] ?? 'Роль ' + admin}</Badge>;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<keyof typeof filters>('all');
  const search = useDeferredValue(query.trim().toLowerCase());
  const shown = useMemo(() => users.filter(user => filters[filter].test(user) && (!search ||
    user.username.toLowerCase().includes(search) || user.email.toLowerCase().includes(search) || String(user.id) === search)),
  [users, filter, search]);

  return <Card>
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ник, почта или ID"
          aria-label="Поиск пользователей" className="pl-9" />
      </div>
      <NativeSelect value={filter} onChange={event => setFilter(event.target.value as keyof typeof filters)} aria-label="Фильтр" className="sm:w-56">
        {Object.entries(filters).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
      </NativeSelect>
    </div>
    <p className="px-4 pt-3 text-[13px] text-muted-foreground" aria-live="polite">
      {shown.length === users.length ? plural(users.length, 'аккаунт', 'аккаунта', 'аккаунтов') : 'Найдено: ' + shown.length + ' из ' + users.length}
    </p>
    {!shown.length ? <Empty icon={Users} title="Никого не нашли">Измените запрос или фильтр.</Empty> : <>
      <Table className="hidden md:table">
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="w-16">ID</TableHead><TableHead>Пользователь</TableHead><TableHead>Роль и статус</TableHead>
          <TableHead className="text-right">Фото</TableHead><TableHead className="hidden xl:table-cell">Прямая загрузка</TableHead><TableHead>Был в сети</TableHead>
        </TableRow></TableHeader>
        <TableBody>{shown.map(user => <TableRow key={user.id} className="cursor-pointer"
          onClick={event => { if (!(event.target as Element).closest('a')) navigate('/admin?type=UserEdit&user_id=' + user.id); }}>
          <TableCell className="text-muted-foreground tabular-nums">{user.id}</TableCell>
          <TableCell><div className="flex items-center gap-3">
            <Avatar src={user.photourl} name={user.username} />
            <div className="min-w-0">
              <Link href={'/admin?type=UserEdit&user_id=' + user.id} className="font-medium hover:underline">{user.username}</Link>
              <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
            </div>
          </div></TableCell>
          <TableCell><div className="flex flex-wrap gap-1.5">
            <RoleBadge admin={user.admin} />
            {user.status === 1 && <Badge variant="destructive">Заблокирован</Badge>}
            {user.directUpload && <Badge variant="success" className="xl:hidden">Прямая загрузка</Badge>}
            {!user.admin && user.status !== 1 && <span className="text-[13px] text-muted-foreground">Пользователь</span>}
          </div></TableCell>
          <TableCell className="text-right tabular-nums">{user.photos}</TableCell>
          <TableCell className="hidden xl:table-cell">{user.directUpload ? <Badge variant="success">Да</Badge> : <span className="text-[13px] text-muted-foreground">Нет</span>}</TableCell>
          <TableCell className="text-[13px] whitespace-nowrap text-muted-foreground">
            {online(user) ? <span className="inline-flex items-center gap-1.5 text-success"><span className="size-1.5 rounded-full bg-success" />в сети</span> : formatDate(user.online)}
          </TableCell>
        </TableRow>)}</TableBody>
      </Table>
      <ul className="divide-y md:hidden">{shown.map(user => <li key={user.id}>
        <Link href={'/admin?type=UserEdit&user_id=' + user.id} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
          <Avatar src={user.photourl} name={user.username} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-medium">
              <span className="truncate">{user.username}</span>
              {online(user) && <span className="size-1.5 shrink-0 rounded-full bg-success" aria-label="в сети" />}
            </p>
            <p className="truncate text-[13px] text-muted-foreground">ID {user.id}, {user.photos} фото</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <RoleBadge admin={user.admin} />
            {user.status === 1 && <Badge variant="destructive">Заблокирован</Badge>}
          </div>
        </Link>
      </li>)}</ul>
    </>}
  </Card>;
}
