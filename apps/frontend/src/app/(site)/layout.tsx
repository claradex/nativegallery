import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import type { Viewer } from '@nativegallery/contracts';
import { Footer } from '../../components/Footer';
import { LoadHead, ProgressBar } from '../../components/LoadHead';
import { EmailVerification, Navbar, NavbarStyle } from '../../components/Navbar';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const cookie = (await headers()).get('cookie');
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: cookie ?? '' }, cache: 'no-store',
  }).catch(() => null);
  const context: { viewer: Viewer | null; databaseVersion: string } = response?.ok
    ? await response.json() : { viewer: null, databaseVersion: '' };
  const title = process.env.SITE_TITLE ?? 'NativeGallery';

  return <html lang="ru">
    <head><LoadHead title={title} cookie={cookie} native /></head>
    <body>
      <ProgressBar />
      <div id="backgr"></div>
      <NavbarStyle />
      {process.env.EMAIL_VERIFY === 'true' && context.viewer?.status === 3 && <EmailVerification />}
      <table className="tmain"><tbody>
        <Navbar path="/rules" title={title} viewer={context.viewer} native />
        {children}
        <tr><Footer databaseVersion={context.databaseVersion} /></tr>
      </tbody></table>
    </body>
  </html>;
}
