import { notFound } from 'next/navigation';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { UsersTable, type UserRow } from './users/UsersTable';
import { UserEditor, type UserDetails } from './users/UserEditor';

export function AdminUsers(origin: string, id?: string) {
  if (id !== undefined && !/^\d{1,10}$/.test(id)) notFound();
  return AdminPage('owner', async () => {
    if (id) {
      const user = await adminData<UserDetails>('/api/admin/users/' + id);
      return <>
        <PageHeader title={user.username} back={{ href: '/admin', label: 'Все пользователи' }}
          description="Права на загрузку, блокировка и роль в команде сайта." />
        <UserEditor user={user} origin={origin} />
      </>;
    }
    const users = await adminData<UserRow[]>('/api/admin/users');
    return <>
      <PageHeader title="Пользователи" description="Аккаунты сайта: роли, блокировки и прямая загрузка без премодерации." />
      <UsersTable users={users} />
    </>;
  });
}
