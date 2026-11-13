import { SiteInteractions } from './SiteInteractions';
import type { ReactNode } from 'react';
import { siteContext } from '../features/site/SiteContext';
import { Footer } from './Footer';
import { LoadHead, ProgressBar } from './LoadHead';
import { EmailVerification, Navbar, NavbarStyle } from './Navbar';

export async function SiteLayout({ children, photo = false }: { children: ReactNode; photo?: boolean }) {
  const context = await siteContext();
  const title = process.env.SITE_TITLE ?? 'NativeGallery';

  return <html lang="ru">
    <head><LoadHead title={title} cookie={context.cookie} /></head>
    <body>
      <SiteInteractions />
      <ProgressBar />
      <div id="backgr"></div>
      <NavbarStyle />
      {process.env.EMAIL_VERIFY === 'true' && context.viewer?.status === 3 && <EmailVerification />}
      <table className="tmain"><tbody>
        <Navbar path={photo ? "/photo" : "/"} title={title} viewer={context.viewer} />
        {children}
        <tr><Footer databaseVersion={context.databaseVersion} /></tr>
      </tbody></table>
    </body>
  </html>;
}
