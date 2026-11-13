'use client';

import { useState } from 'react';

const links = [
  ['', 'user-pin', 'Пользователи'], ['Photo', 'camera', 'Фотографии'],
  ['Galleries', 'images', 'Галереи'], ['News', 'news', 'Новости сайта'], ['Pages', 'file', 'Страницы'],
  ['Contests', 'party', 'Фотоконкурсы'], ['Entities', 'package', 'Сущности'],
  ['Models', 'data', 'База моделей'], ['GeoDB', 'world', 'GeoDB'], ['Settings', 'cog', 'Настройки'],
];

export function AdminSidebar({ title, pending }: { title: string; pending: number }) {
  const [open, setOpen] = useState(false);
  return <div className="layout__left-column layout__sticky">
    <header className="header" style={{ backgroundColor: '#0d1012' }}>
      <div className="header__container"><div className="header__toggle">
        <i className={open ? 'bx bx-menu bx-x' : 'bx bx-menu'} id="header-toggle" onClick={() => setOpen(value => !value)} />
      </div></div>
    </header>
    <div className={open ? 'nav show-menu' : 'nav'} id="navbar"><nav className="nav__container"><div>
      <a href="/admin" className="nav__link nav__logo"><h5><b>{title}</b></h5></a>
      <div className="nav__list"><div className="nav__items"><h3 className="nav__subtitle" />
        {links.map(([section, icon, label]) => <a key={section} href={section ? '/admin?type=' + section : '/admin'} className="nav__link">
          <i className={'bx bx-' + icon + ' nav__icon'} />
          <span className="nav__name">{label}{section === 'Photo' && pending > 0 && <> <span className="badge text-bg-danger">{pending}</span></>}
            {['Contests', 'GeoDB', 'Settings'].includes(section) && <> <span className="badge text-bg-warning">BETA</span></>}
          </span>
        </a>)}
      </div></div>
    </div></nav></div>
  </div>;
}
