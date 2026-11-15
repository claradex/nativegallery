import { setting } from '@nativegallery/config';
import Link from './Link';
export function Footer({ databaseVersion }: { databaseVersion: string }) {
  const revision = process.env.SITE_REVISION ?? '4ebe9c8';
  return <td className="footer">
    <p>{setting('SITE_FOOTER_SLOGAN')} | Node.js {process.versions.node.split('.')[0]} | MySQL {databaseVersion} | Версия {revision}</p>
    <b><Link href="/">Главная</Link> &nbsp; &nbsp; <Link href="/lk/">Личный кабинет</Link> &nbsp; &nbsp; <Link href="/rules">Правила</Link> &nbsp; &nbsp; <Link href="/about">О сервере</Link></b><br />
  </td>;
}
