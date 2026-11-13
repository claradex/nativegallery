import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate } from '@nativegallery/contracts';

interface Profile {
  id: number; username: string; admin: number; photourl: string; online: number;
  registered: number; city: string; languages: string; about: string; badge: string;
  own: boolean; signedIn: boolean; followers: number; subscribed: boolean;
}

function Details({ rows }: { rows: [string, React.ReactNode][] }) {
  return <table style={{ marginBottom: 15 }}><colgroup><col style={{ width: 250 }} /></colgroup><tbody>
    {rows.map(([label, value]) => <tr key={label}><td className="sm" style={{ padding: '3px 10px 3px 0' }}><b>{label}</b></td>
      <td><span className="sm">{value}</span></td></tr>)}
  </tbody></table>;
}

function ProfileContent({ profile }: { profile: Profile }) {
  const avatar = profile.photourl || '/static/img/avatar.png';
  return <>
    <h1>{profile.username}{profile.admin === 1 && <img width={32} src="/static/img/star.png" alt="" loading="lazy" />}</h1>
    {profile.admin === 1 ? 'Администратор сервера' : profile.admin === 2 ? 'Фотомодератор' : null}
    {profile.own && <p><b><a href="/lk/profile">Редактировать мой профиль</a></b></p>}
    <div className="p20" style={{ paddingRight: 12 }}>
      {profile.badge && <><div style={{ float: 'left', border: 'solid 1px #3b7dc1', padding: '6px 10px 7px',
        marginBottom: 13, backgroundColor: '#0199ff44', whiteSpace: 'pre-line' }}><b>{profile.badge}</b></div><br /></>}
      <table style={{ width: '100%' }}><tbody><tr>
        <td style={{ verticalAlign: 'top', width: '100%' }}>
          <Details rows={[
            ['Дата регистрации:', legacyDate(profile.registered)],
            ['Был на сайте:', <>{legacyDate(profile.online)} {Date.now() / 1000 - profile.online <= 300 && <>(<b>online</b>)</>}</>],
          ]} />
          {(profile.city || profile.languages) && <Details rows={[
            ...(profile.city ? [['Откуда:', profile.city] as [string, string]] : []),
            ...(profile.languages ? [['Владение языками:', profile.languages] as [string, string]] : []),
          ]} />}
        </td>
        <td style={{ verticalAlign: 'top' }}><a href={avatar}><img src={avatar} alt="" id="userphoto_img" className="f"
          data-avatar-fallback style={{ width: 'auto', maxWidth: 100 }} loading="lazy" /></a></td>
      </tr></tbody></table>
    </div>
    {profile.about && <div className="p20" style={{ marginTop: 8 }}><h4>О себе</h4>
      <span style={{ whiteSpace: 'pre-line' }}>{profile.about}</span></div>}
    <div style={{ marginTop: 25 }}><b><a href={'/search?id=' + profile.id}>Найти все фотографии, сделанные этим пользователем</a></b></div>
    {profile.own ? <div style={{ marginTop: 8 }}>Пользователей, подписанных на мои фотографии: <b>{profile.followers}</b></div>
      : <div style={{ marginTop: 8 }} data-author-subscription={profile.signedIn ? profile.id : undefined}>
        <div className={'toggle' + (profile.subscribed ? ' on' : '')} role="switch" tabIndex={0} aria-label="Подписка"
          aria-checked={profile.subscribed}><div className="handle" /></div>&nbsp;
        <label className="toggle-label"><b>Подписка на новые фотографии этого автора</b> (подписаны: <b id="subscr_cnt">{profile.followers}</b>)</label>
        {!profile.signedIn && <> <a href="/login">Войти</a></>}
      </div>}
  </>;
}

export async function Author(request: Request, api: string, id: string) {
  const response = await fetch(api + '/api/internal/author/' + id, {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response || (!response.ok && response.status !== 404)) return new Response('Service Unavailable', { status: 503 });
  const profile: Profile | null = response.ok ? await response.json() : null;
  const content = renderToStaticMarkup(<tr><td className="main">
    {profile ? <ProfileContent profile={profile} /> : <div style={{ textAlign: 'center' }}>
      <h1>Пользователь не найден</h1><img src="/static/img/404.jpg" alt="" loading="lazy" />
    </div>}
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">' +
    '__NAVBAR__' + content + '<tr>__FOOTER__</tr></table>__SCRIPT_Author__</body></html>';
}
