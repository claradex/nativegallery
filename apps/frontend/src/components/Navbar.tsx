import Link from './Link';
import type { Viewer } from '@nativegallery/contracts';
import { SmallTitle, TitleRow } from './NavbarTitle';
import { MobileMenu } from './MobileMenu';
import { mainMenu, userMenu, type MenuEntry } from './menu';

function Notice({ count }: { count?: number | string }) {
  return <>
{!!count && <span className="mm-notify notify-count">{count}</span>}
  </>;
}

function Item({ entry }: { entry: MenuEntry }) {
  const content = <>
    {entry.icon && <span className="mm-icon"><i className={entry.icon}></i></span>}
    <span className="mm-label">{entry.bold ? <b>{entry.label}</b> : entry.label}</span><Notice count={entry.notice} />
  </>;
  if (entry.reload) return <a href={entry.href} className="mm-item">{content}</a>;
  if (!entry.href) return <a href="#" className="mm-item">{content}</a>;
  return <Link href={entry.href} className="mm-item">{content}</Link>;
}

function DesktopEntry({ entry }: { entry: MenuEntry }) {
  return <li className={entry.className}><Item entry={entry} />
    {entry.children && <div><ul className="mm-level-2">
      {entry.children.map(child => <DesktopEntry key={child.label} entry={child} />)}
    </ul></div>}
  </li>;
}

export function EmailVerification() {
  return <>
<div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff' }}>
<div className="center"><h4 style={{ color: '#fff', marginBottom: 3 }}>Пожалуйста, подтвердите свою почту</h4>
<div>Так мы сможем убедиться, что Вы настоящий человек. После подтверждения, Вам будет доступен полностью функционал сайта.<br /><br /><b>Письмо с ссылкой для подтверждения почты была отправлена на Ваш ящик, указанный при регистрации.</b></div></div></div>
  </>;
}

export function Navbar({ title: siteTitle, viewer }: { title: string; viewer: Viewer | null }) {
  const verify = process.env.EMAIL_VERIFY === 'true' && viewer?.status === 3;
  const logo = process.env.SITE_LOGO ?? '/static/img/logosmall.png';
  const title = process.env.SITE_SHOW_TITLE === 'false' ? '' : siteTitle;
  const main = mainMenu(viewer);
  const user = userMenu(viewer, verify);
  return <>
<tr>
    <td id="navbar" className="mm-bar">
    <SmallTitle logo={logo} title={title} />
        <ul className="mm mm-level-1">
            {[...main, ...user].map(entry => <DesktopEntry key={entry.label} entry={entry} />)}
        </ul>
    </td>
</tr>
<TitleRow logo={logo} title={title} />
<MobileMenu logo={logo} title={title} main={main} user={user} signedIn={!!viewer} />
  </>;
}
