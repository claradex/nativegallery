import type { Viewer } from '@nativegallery/contracts';

function Notice({ count }: { count: number }) {
  return <>
{count > 0 && <span className="mm-notify notify-count">{count}</span>}
  </>;
}

function GuestMenu() {
  return <>
<li className="mm-pad-right"><a href="/login" className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-address-card"></i></span><span className="mm-label">Войти</span></a></li>
                <li><a href="/register" className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-user"></i></span><span className="mm-label">Регистрация</span></a></li>
  </>;
}

export function EmailVerification() {
  return <>
<div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff' }}>
<center><h4 style={{ color: '#fff', marginBottom: 3 }}>Пожалуйста, подтвердите свою почту</h4>
<div>Так мы сможем убедиться, что Вы настоящий человек. После подтверждения, Вам будет доступен полностью функционал сайта.<br /><br /><b>Письмо с ссылкой для подтверждения почты была отправлена на Ваш ящик, указанный при регистрации.</b></div></center></div>
  </>;
}

function AdminMenuItem({ count }: { count: number }) {
  return <>
<li><a href="/admin" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-info-circle"></i></span><span className="mm-label">Admin</span><Notice count={count} /></a></li>
  </>;
}

function UploadMenuItem() {
  return <>
<li><a href="/lk/upload" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-plus-square"></i></span><span className="mm-label"><b>Предложить медиа</b></span></a></li>
  </>;
}

function MemberMenu({ viewer, verify }: { viewer: Viewer; verify: boolean }) {
  return <>
<li className="mm-pad-right mm-wide"><a href={'/author/' + viewer.id + '/'} className="mm-item"><span className="mm-icon"><i className="fas fa-xs fa-user"></i></span><span className="mm-label">{viewer.username}</span><Notice count={viewer.pendingPhotos} /></a>
                    <div>
                        <ul className="mm-level-2">
                            <li><a href="/lk/" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-info-circle"></i></span><span className="mm-label">Общая информация</span></a></li>
                            {viewer.admin > 0 && <AdminMenuItem count={viewer.pendingPhotos} />}{!verify && <UploadMenuItem />}
                            <li><a href="/lk/history" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-images"></i></span><span className="mm-label">Журнал</span></a></li>
                            <li><a href="/lk/konkurs.php" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-compass"></i></span><span className="mm-label">Конкурс</span></a></li>
                            <li><a href="/vehicle/edit" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-folder-plus"></i></span><span className="mm-label"><b>Правка БД</b></span></a></li>
                            <li><a href="/lk/ticket.php" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-question-circle"></i></span><span className="mm-label">Мои заявки</span></a></li>
                            <li><a href="/lk/profile" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-cog"></i></span><span className="mm-label">Настройки профиля</span></a></li>
                            <li><a href={'/search?id=' + viewer.id} className="mm-item"><span className="mm-icon"><i className="far fa-sm fa-fw fa-images"></i></span><span className="mm-label">Мои фотографии</span></a></li>
                            <li><a href="/fav" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-star"></i></span><span className="mm-label">Избранные снимки</span></a></li>
                            <li><a href="/logout" className="mm-item"><span className="mm-icon"><i className="fas fa-sm fa-fw fa-sign-out-alt"></i></span><span className="mm-label">Выход</span></a></li>
                        </ul>
                    </div>
                </li>
  </>;
}

export function Navbar({ path, title: siteTitle, viewer }: { path: string; title: string; viewer: Viewer | null }) {
  const photo = path.split('/')[1] === 'photo';
  const hidden = { display: 'none' };
  const verify = process.env.EMAIL_VERIFY === 'true' && viewer?.status === 3;
  const logo = process.env.SITE_LOGO ?? '/static/img/logosmall.png';
  const title = process.env.SITE_SHOW_TITLE === 'false' ? '' : siteTitle;
  return <>
<tr>
    <td id="navbar" className="mm-bar">
    <a style={photo ? undefined : hidden} id="title-small" href="/"><img src={logo} />{title}</a>
        <ul className="mm mm-level-1">
            <li><a href="#" className="mm-item"><span className="mm-label">Дополнительно</span></a>
                <div>
                    <ul className="mm-level-2">
                        <li><a href="/news.php" className="mm-item"><span className="mm-label">Новости и хронология</span></a></li>
                        <li><a href="/misc/" className="mm-item"><span className="mm-label">Разные фотогалереи</span></a></li>
                        <li><a href="/voting.php" className="mm-item"><span className="mm-label">Фотоконкурс</span></a></li>
                        <li><a href="/news2.php" className="mm-item"><span className="mm-label">Новости сайта</span></a></li>
                        <li><a href="/links.php" className="mm-item"><span className="mm-label">Ссылки</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/comments" className="mm-item"><span className="mm-label">Комментарии</span></a></li>
            <li><a href="#" className="mm-item"><span className="mm-label">Обновления</span><Notice count={viewer?.unreadPhotos ?? 0} /></a>
                <div>
                    <ul className="mm-level-2">
                        <li><a href="/update.php?time=24" className="mm-item"><span className="mm-label">Новые фотографии</span></a></li>
                        <li><a href="/feed" className="mm-item"><span className="mm-label">Лента обновлений</span></a></li>
                        <li><a href="/fav_authors" className="mm-item"><span className="mm-label">Фотографии избранных авторов</span><Notice count={viewer?.unreadPhotos ?? 0} /></a></li>
                        <li><a href="/update.php" className="mm-item"><span className="mm-label">Архив обновлений по датам</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/help/" className="mm-item"><span className="mm-label">Помощь</span></a>
                <div>
                    <ul className="mm-level-2">
                        <li><a href="/rules/" className="mm-item"><span className="mm-label">Правила сайта</span></a></li>
                        <li><a href="/rules/pub/" className="mm-item"><span className="mm-label">Критерии отбора фотографий</span></a></li>
                        <li><a href="/rules/photo/" className="mm-item"><span className="mm-label">Правила подписи фотографий</span></a></li>
                        <li><a href="/rules/video/" className="mm-item"><span className="mm-label">Правила видеокаталога</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/search.php" className="mm-item"><span className="mm-label">Поиск</span></a>
                <div>
                    <ul className="mm-level-2">
                        <li><a href="/search.php" className="mm-item"><span className="mm-label">Поиск фотографий</span></a></li>
                        <li><a href="/vsearch.php" className="mm-item"><span className="mm-label">Поиск ТС</span></a></li>
                        <li><a href="/csearch.php" className="mm-item"><span className="mm-label">Поиск комментариев</span></a></li>
                        <li><a href="/authors.php" className="mm-item"><span className="mm-label">Поиск авторов</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/mapmedia" className="mm-item"><span className="mm-label">Map Media<span className="mm-notify notify-count">NEW</span></span></a></li>
            {viewer ? <MemberMenu viewer={viewer} verify={verify} /> : <GuestMenu />}

        </ul>
    </td>
</tr>
<tr style={photo ? hidden : undefined} id="navbard">
    <td><a href="/" id="title"><img style={{ width: 70 }} src={logo} alt={title} /><span>{title}</span></a></td>
</tr>
  </>;
}
