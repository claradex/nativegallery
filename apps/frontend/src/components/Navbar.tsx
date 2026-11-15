import Link from './Link';
import type { Viewer } from '@nativegallery/contracts';
import { SmallTitle, TitleRow } from './NavbarTitle';

function Notice({ count }: { count: number }) {
  return <>
{count > 0 && <span className="mm-notify notify-count">{count}</span>}
  </>;
}

function GuestMenu() {
  return <>
<li className="mm-pad-right"><Link href="/login" className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-address-card"></i></span><span className="mm-label">Войти</span></Link></li>
                <li><Link href="/register" className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-user"></i></span><span className="mm-label">Регистрация</span></Link></li>
  </>;
}

export function EmailVerification() {
  return <>
<div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff' }}>
<div className="center"><h4 style={{ color: '#fff', marginBottom: 3 }}>Пожалуйста, подтвердите свою почту</h4>
<div>Так мы сможем убедиться, что Вы настоящий человек. После подтверждения, Вам будет доступен полностью функционал сайта.<br /><br /><b>Письмо с ссылкой для подтверждения почты была отправлена на Ваш ящик, указанный при регистрации.</b></div></div></div>
  </>;
}

function AdminMenuItem({ count }: { count: number }) {
  return <>
<li><Link href="/admin" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-info-circle"></i></span><span className="mm-label">Admin</span><Notice count={count} /></Link></li>
  </>;
}

function UploadMenuItem() {
  return <>
<li><Link href="/lk/upload" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-plus-square"></i></span><span className="mm-label"><b>Предложить медиа</b></span></Link></li>
  </>;
}

function MemberMenu({ viewer, verify }: { viewer: Viewer; verify: boolean }) {
  return <>
<li className="mm-pad-right mm-wide"><Link href={'/author/' + viewer.id + '/'} className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-user"></i></span><span className="mm-label">{viewer.username}</span><Notice count={viewer.pendingPhotos} /></Link>
                    <div>
                        <ul className="mm-level-2">
                            <li><Link href="/lk/" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-info-circle"></i></span><span className="mm-label">Общая информация</span></Link></li>
                            {viewer.admin > 0 && <AdminMenuItem count={viewer.pendingPhotos} />}{!verify && <UploadMenuItem />}
                            <li><Link href="/lk/history" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-images"></i></span><span className="mm-label">Журнал</span></Link></li>
                            <li><Link href="/lk/konkurs.php" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-compass"></i></span><span className="mm-label">Конкурс</span></Link></li>
                            <li><Link href="/vehicle/edit" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-folder-plus"></i></span><span className="mm-label"><b>Правка БД</b></span></Link></li>
                            <li><Link href="/lk/ticket.php" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-question-circle"></i></span><span className="mm-label">Мои заявки</span></Link></li>
                            <li><Link href="/lk/profile" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-cog"></i></span><span className="mm-label">Настройки профиля</span></Link></li>
                            <li><Link href={'/search?id=' + viewer.id} className="mm-item"><span className="mm-icon"><i className="far fa-sm fa-fw fa-images"></i></span><span className="mm-label">Мои фотографии</span></Link></li>
                            <li><Link href="/fav" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-star"></i></span><span className="mm-label">Избранные снимки</span></Link></li>
                            <li><a href="/logout" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-sign-out-alt"></i></span><span className="mm-label">Выход</span></a></li>
                        </ul>
                    </div>
                </li>
  </>;
}

export function Navbar({ title: siteTitle, viewer }: { title: string; viewer: Viewer | null }) {
  const verify = process.env.EMAIL_VERIFY === 'true' && viewer?.status === 3;
  const logo = process.env.SITE_LOGO ?? '/static/img/logosmall.png';
  const title = process.env.SITE_SHOW_TITLE === 'false' ? '' : siteTitle;
  return <>
<tr>
    <td id="navbar" className="mm-bar">
    <SmallTitle logo={logo} title={title} />
        <ul className="mm mm-level-1">
            <li><a href="#" className="mm-item"><span className="mm-label">Дополнительно</span></a>
                <div>
                    <ul className="mm-level-2">
                        <li><Link href="/news.php" className="mm-item"><span className="mm-label">Новости и хронология</span></Link></li>
                        <li><Link href="/misc/" className="mm-item"><span className="mm-label">Разные фотогалереи</span></Link></li>
                        <li><Link href="/voting" className="mm-item"><span className="mm-label">Фотоконкурс</span></Link></li>
                        <li><Link href="/news" className="mm-item"><span className="mm-label">Новости сайта</span></Link></li>
                        <li><Link href="/links.php" className="mm-item"><span className="mm-label">Ссылки</span></Link></li>
                    </ul>
                </div>
            </li>
            <li><Link href="/comments" className="mm-item"><span className="mm-label">Комментарии</span></Link></li>
            <li><a href="#" className="mm-item"><span className="mm-label">Обновления</span><Notice count={viewer?.unreadPhotos ?? 0} /></a>
                <div>
                    <ul className="mm-level-2">
                        <li><Link href="/update?time=24" className="mm-item"><span className="mm-label">Новые фотографии</span></Link></li>
                        <li><Link href="/feed" className="mm-item"><span className="mm-label">Лента обновлений</span></Link></li>
                        <li><Link href="/fav_authors" className="mm-item"><span className="mm-label">Фотографии избранных авторов</span><Notice count={viewer?.unreadPhotos ?? 0} /></Link></li>
                        <li><Link href="/update" className="mm-item"><span className="mm-label">Архив обновлений по датам</span></Link></li>
                    </ul>
                </div>
            </li>
            <li><Link href="/help/" className="mm-item"><span className="mm-label">Помощь</span></Link>
                <div>
                    <ul className="mm-level-2">
                        <li><Link href="/rules/" className="mm-item"><span className="mm-label">Правила сайта</span></Link></li>
                        <li><Link href="/rules/pub/" className="mm-item"><span className="mm-label">Критерии отбора фотографий</span></Link></li>
                        <li><Link href="/rules/photo/" className="mm-item"><span className="mm-label">Правила подписи фотографий</span></Link></li>
                        <li><Link href="/rules/video/" className="mm-item"><span className="mm-label">Правила видеокаталога</span></Link></li>
                    </ul>
                </div>
            </li>
            <li><Link href="/search" className="mm-item"><span className="mm-label">Поиск</span></Link>
                <div>
                    <ul className="mm-level-2">
                        <li><Link href="/search" className="mm-item"><span className="mm-label">Поиск фотографий</span></Link></li>
                        <li><Link href="/vsearch.php" className="mm-item"><span className="mm-label">Поиск ТС</span></Link></li>
                        <li><Link href="/csearch.php" className="mm-item"><span className="mm-label">Поиск комментариев</span></Link></li>
                        <li><Link href="/authors" className="mm-item"><span className="mm-label">Поиск авторов</span></Link></li>
                    </ul>
                </div>
            </li>
            <li><Link href="/mapmedia" className="mm-item"><span className="mm-label">Map Media<span className="mm-notify notify-count">NEW</span></span></Link></li>
            {viewer ? <MemberMenu viewer={viewer} verify={verify} /> : <GuestMenu />}

        </ul>
    </td>
</tr>
<TitleRow logo={logo} title={title} />
  </>;
}
