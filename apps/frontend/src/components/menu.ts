import type { Viewer } from '@nativegallery/contracts';

/**
 * The site menu as data, so the desktop bar (`Navbar`) and the phone burger menu (`MobileMenu`) list the same items.
 */
export interface MenuEntry {
  label: string;
  /** No `href`: a heading that only opens its sub-menu. */
  href?: string;
  /** Font Awesome classes of the leading icon. */
  icon?: string;
  bold?: boolean;
  /** Counter shown after the label; zero hides it. */
  notice?: number | string;
  /** Needs a full page load (logout), not client navigation. */
  reload?: boolean;
  /** Extra classes of the desktop `<li>`. */
  className?: string;
  children?: MenuEntry[];
}

export function mainMenu(viewer: Viewer | null): MenuEntry[] {
  const unread = viewer?.unreadPhotos ?? 0;
  return [
    { label: 'Дополнительно', children: [
      { label: 'Новости и хронология', href: '/news.php' },
      { label: 'Разные фотогалереи', href: '/misc/' },
      { label: 'Фотоконкурс', href: '/voting' },
      { label: 'Новости сайта', href: '/news' },
      { label: 'Ссылки', href: '/links.php' },
    ] },
    { label: 'Комментарии', href: '/comments' },
    { label: 'Обновления', notice: unread, children: [
      { label: 'Новые фотографии', href: '/update?time=24' },
      { label: 'Лента обновлений', href: '/feed' },
      { label: 'Фотографии избранных авторов', href: '/fav_authors', notice: unread },
      { label: 'Архив обновлений по датам', href: '/update' },
    ] },
    { label: 'Помощь', href: '/help/', children: [
      { label: 'Правила сайта', href: '/rules/' },
      { label: 'Критерии отбора фотографий', href: '/rules/pub/' },
      { label: 'Правила подписи фотографий', href: '/rules/photo/' },
      { label: 'Правила видеокаталога', href: '/rules/video/' },
    ] },
    { label: 'Поиск', href: '/search', children: [
      { label: 'Поиск фотографий', href: '/search' },
      { label: 'Поиск ТС', href: '/vsearch.php' },
      { label: 'Поиск комментариев', href: '/csearch.php' },
      { label: 'Поиск авторов', href: '/authors' },
    ] },
    { label: 'Map Media', href: '/mapmedia', notice: 'NEW' },
  ];
}

const sub = 'fas fa-sm fa-fw ';

/** Sign-in links for guests, or the member's own section under their name. */
export function userMenu(viewer: Viewer | null, verify: boolean): MenuEntry[] {
  if (!viewer) return [
    { label: 'Войти', href: '/login', icon: 'fas fa-xs fa-address-card', className: 'mm-pad-right' },
    { label: 'Регистрация', href: '/register', icon: 'fas fa-xs fa-user' },
  ];
  const children: MenuEntry[] = [
    { label: 'Общая информация', href: '/lk/', icon: sub + 'fa-info-circle' },
    ...viewer.admin > 0 ? [{ label: 'Admin', href: '/admin', icon: sub + 'fa-info-circle', notice: viewer.pendingPhotos }] : [],
    ...verify ? [] : [{ label: 'Предложить медиа', href: '/lk/upload', icon: sub + 'fa-plus-square', bold: true }],
    { label: 'Журнал', href: '/lk/history', icon: sub + 'fa-images' },
    { label: 'Конкурс', href: '/lk/konkurs.php', icon: sub + 'fa-compass' },
    { label: 'Правка БД', href: '/vehicle/edit', icon: sub + 'fa-folder-plus', bold: true },
    { label: 'Мои заявки', href: '/lk/ticket.php', icon: sub + 'fa-question-circle' },
    { label: 'Настройки профиля', href: '/lk/profile', icon: sub + 'fa-cog' },
    { label: 'Мои фотографии', href: '/search?id=' + viewer.id, icon: 'far fa-sm fa-fw fa-images' },
    { label: 'Избранные снимки', href: '/fav', icon: sub + 'fa-star' },
    { label: 'Выход', href: '/logout', icon: sub + 'fa-sign-out-alt', reload: true },
  ];
  return [{
    label: viewer.username, href: '/author/' + viewer.id + '/', icon: 'fas fa-xs fa-user', notice: viewer.pendingPhotos,
    className: 'mm-pad-right mm-wide', children,
  }];
}
