import { legacyDate } from '@nativegallery/contracts';
import { NotFound } from '../site/StaticPages';
import { AdminPage } from './AdminPage';

interface UserRow {
  id: number;
  username: string;
  email: string;
  photourl: string;
  directUpload: boolean;
}
interface UserDetails extends UserRow {
  status: number;
  admin: number;
  online: number;
  canChangeAccess: boolean;
}

function UserList({ users, origin }: { users: UserRow[]; origin: string }) {
  return <table className="table" style={{ marginTop: 15 }}>
    <thead><tr>{['ID', '', 'Никнейм', 'Почта', 'Прямая загрузка', 'Ссылка', ''].map((label, index) =>
      <th key={index} scope="col">{label}</th>)}</tr></thead>
    <tbody>{users.map(user => <tr key={user.id}>
      <th scope="row">{user.id}</th>
      <td><img src={user.photourl} width={35} alt="" loading="lazy" /></td>
      <td>{user.username}</td><td>{user.email}</td><td>{user.directUpload ? 'Да' : 'Нет'}</td>
      <td><a href={'/author/' + user.id}>{origin}/author/{user.id}</a></td>
      <td><div className="cmt-submit"><a href={'/admin?type=UserEdit&user_id=' + user.id}>Редактировать</a></div></td>
    </tr>)}</tbody>
  </table>;
}

function UserEditor({ user, origin }: { user: UserDetails; origin: string }) {
  return <form action={'/api/admin/users/' + user.id} id="user-edit" style={{ display: 'inline-block', minWidth: 500 }}>
    <p><img src={user.photourl} width={50} alt="" loading="lazy" /> {user.username}</p>
    <p>Был в сети: <b>{legacyDate(user.online)} {user.online >= Date.now() / 1000 - 300 && <i>(online)</i>}</b></p>
    <p>Ссылка на профиль: <b><a href={'/author/' + user.id}>{origin}/author/{user.id}</a></b></p>
    <div className="p20" style={{ textAlign: 'left', marginBottom: 15 }}>
      <h4 className="mt-3"><b>Настройки</b></h4>
      <label className="d-block mt-1">Прямая загрузка<select className="form-select" name="premoderation" defaultValue={String(user.directUpload)}>
        <option value="true">Да</option><option value="false">Нет</option>
      </select></label>
      <label className="d-block mt-1">Статус аккаунта<select className="form-select" name="accountstatus" defaultValue={[0, 1].includes(user.status) ? user.status : ''} disabled={!user.canChangeAccess}>
        {![0, 1].includes(user.status) && <option value="">Текущий статус ({user.status})</option>}
        <option value="0">Без ограничений</option><option value="1">Заблокирован</option>
      </select></label>
      <label className="d-block mt-1">Роль<select className="form-select" name="admin" defaultValue={user.admin} disabled={!user.canChangeAccess}>
        <option value="0">Пользователь</option><option value="1">Администратор</option>
        <option value="2">Фотомодератор</option><option value="3">Модератор</option>
      </select></label>
    </div>
    <div className="cmt-submit"><button className="btn btn-primary" type="submit">Применить</button></div>
    <p id="user-status" role="status" hidden />
  </form>;
}

export function AdminUsers(request: Request, api: string, id?: string) {
  if (id !== undefined && !/^\d{1,10}$/.test(id)) return NotFound(request);
  const origin = process.env.SITE_ORIGIN ?? new URL(request.url).origin;
  return AdminPage(request, api, 'Пользователи', 'AdminUsers', async options => {
    const response = await fetch(api + '/api/admin/users' + (id ? '/' + id : ''), options).catch(() => null);
    if (response?.status === 403) return new Response('Forbidden', { status: 403 });
    if (response?.status === 404) return NotFound(request);
    if (!response?.ok) return null;
    return id ? <UserEditor user={await response.json()} origin={origin} />
      : <UserList users={await response.json()} origin={origin} />;
  });
}
