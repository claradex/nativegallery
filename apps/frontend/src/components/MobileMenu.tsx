'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from './Link';
import type { MenuEntry } from './menu';

type Panel = 'user' | 'main';

/**
 * Phone header: the logo with two buttons on the right, the profile and the burger (☰), each dropping a full-width
 * panel down under the header. Items with a sub-menu open it in place, accordion-style: opening one closes the others.
 * Only shown below the mobile breakpoint (see mobile.css); the desktop bar stays as it is.
 */
export function MobileMenu({ logo, title, main, user, signedIn }: {
  logo: string; title: string; main: MenuEntry[]; user: MenuEntry[]; signedIn: boolean;
}) {
  const [open, setOpen] = useState<Panel | null>(null);
  const root = useRef<HTMLTableCellElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(null), [pathname]);

  useEffect(() => {
    if (!open) return;
    const events = new AbortController();
    document.addEventListener('pointerdown', event => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(null);
    }, { signal: events.signal });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      setOpen(null);
      root.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')?.focus();
    }, { signal: events.signal });
    return () => events.abort();
  }, [open]);

  /** A tapped link leaves the page (or reloads it with a new query), so the panel has done its job. */
  function closeOnLink(event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(null);
  }

  const toggle = (panel: Panel) => setOpen(current => current === panel ? null : panel);
  const userItems = user.flatMap(entry => entry.children ? [{ ...entry, children: undefined }, ...entry.children] : [entry]);
  const userCount = count(user);
  const mainCount = count(main);

  return <tr id="mm-mobile">
    <td ref={root}>
      <div className="mmm-head">
        <Link href="/" className="mmm-title"><img src={logo} alt="" /><span>{title}</span></Link>
        <button type="button" className="mmm-btn" aria-label={signedIn ? 'Личный кабинет' : 'Вход и регистрация'}
                aria-expanded={open === 'user'} aria-controls="mmm-user" onClick={() => toggle('user')}>
          <i className={open === 'user' ? 'fas fa-times' : 'far fa-user-circle'}></i>
          {userCount > 0 && open !== 'user' && <span className="mmm-badge">{userCount}</span>}
        </button>
        <button type="button" className="mmm-btn" aria-label="Меню" aria-expanded={open === 'main'} aria-controls="mmm-main"
                onClick={() => toggle('main')}>
          <i className={open === 'main' ? 'fas fa-times' : 'fas fa-bars'}></i>
          {mainCount > 0 && open !== 'main' && <span className="mmm-badge">{mainCount}</span>}
        </button>
      </div>
      <nav id="mmm-user" className="mmm-panel" hidden={open !== 'user'} onClick={closeOnLink} aria-label="Личный кабинет">
        <MobileList entries={userItems} level={1} />
      </nav>
      <nav id="mmm-main" className="mmm-panel" hidden={open !== 'main'} onClick={closeOnLink} aria-label="Меню сайта">
        <MobileList entries={main} level={1} />
      </nav>
    </td>
  </tr>;
}

function count(entries: MenuEntry[]) {
  return entries.reduce((sum, entry) => sum + (typeof entry.notice === 'number' ? entry.notice : 0), 0);
}

function MobileList({ entries, level }: { entries: MenuEntry[]; level: number }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <ul className={'mmm-level-' + level}>
    {entries.map(entry => {
      if (!entry.children) return <li key={entry.label}><MobileItem entry={entry} /></li>;
      const isOpen = expanded === entry.label;
      // A heading that is also a page (Помощь, Поиск) keeps that page as the first item of its sub-menu.
      const children = entry.href && !entry.children.some(child => child.href === entry.href)
        ? [{ label: entry.label, href: entry.href, bold: true }, ...entry.children] : entry.children;
      return <li key={entry.label} className={isOpen ? 'mmm-open' : undefined}>
        <button type="button" className="mmm-item mmm-toggle" aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : entry.label)}>
          <ItemContent entry={entry} />
          <i className="fas fa-chevron-down mmm-chevron" aria-hidden="true"></i>
        </button>
        {isOpen && <MobileList entries={children} level={level + 1} />}
      </li>;
    })}
  </ul>;
}

function ItemContent({ entry }: { entry: MenuEntry }) {
  return <>
    {entry.icon && <span className="mmm-icon"><i className={entry.icon}></i></span>}
    <span className="mmm-label">{entry.bold ? <b>{entry.label}</b> : entry.label}</span>
    {!!entry.notice && <span className="notify-count">{entry.notice}</span>}
  </>;
}

function MobileItem({ entry }: { entry: MenuEntry }) {
  if (entry.reload) return <a href={entry.href} className="mmm-item"><ItemContent entry={entry} /></a>;
  return <Link href={entry.href ?? '/'} className="mmm-item"><ItemContent entry={entry} /></Link>;
}
