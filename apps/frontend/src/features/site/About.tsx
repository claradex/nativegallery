import type { SiteOverview } from '@nativegallery/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { readTemplate } from '../../components/ReadTemplate';

const roles = [
  { id: 1, icon: '220.ico', label: 'Администраторы' },
  { id: 2, icon: '248.ico', label: 'Фотомодераторы' },
  { id: 3, icon: '152.ico', label: 'Модераторы' },
];

function StaffMember({ user }: { user: SiteOverview['staff'][number] }) {
  return (
    <li>
      <b>
        <a href={'/author/' + user.id + '/'}>
          <img src={user.photourl || '/static/img/avatar.png'} width={32} loading="lazy"
            data-avatar-fallback style={{ borderRadius: 3, marginRight: 5 }} />
          {user.username}
        </a>
      </b>
    </li>
  );
}

function AboutContent({ data, title, description }: { data: SiteOverview; title: string; description: string }) {
  return (
    <>
      <h1>О сервере <b>{title}</b></h1>
      <p>{description}</p>
      <div className="p20">
        <h4><img src="/static/img/go-home.png" loading="lazy" />Общая информация</h4>
        <ul className="straight">
          <li>Зарегистрировано пользователей: <b>{data.users}</b></li>
          <li>Опубликовано фотографий: <b>{data.photos}</b></li>
          <li>Пользователей онлайн: <b>{data.online}</b></li>
        </ul>
      </div>
      {roles.map(role => (
        <div className="p20" key={role.id}>
          <h4><img src={'/static/img/' + role.icon} loading="lazy" />{role.label}</h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.staff.filter(user => user.admin === role.id).map(user => <StaffMember key={user.id} user={user} />)}
          </ul>
        </div>
      ))}
      <table width="100%" />
    </>
  );
}

export async function About(api: string) {
  const response = await fetch(api + '/api/internal/about', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return null;
  const data: SiteOverview = await response.json();
  const content = renderToStaticMarkup(<AboutContent data={data}
    title={process.env.SITE_TITLE ?? 'NativeGallery'} description={process.env.SITE_DESCRIPTION ?? ''} />);
  return readTemplate('src/features/site/About.html').replace('__ABOUT_CONTENT__', () => content);
}
