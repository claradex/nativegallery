import { ClientNavigation } from './ClientNavigation';
import { SiteInteractions } from './SiteInteractions';
import type { ReactNode } from 'react';
import { siteContext } from '../features/site/SiteContext';
import { narrowFont } from '../styles/fonts';
import { Footer } from './Footer';
import { ProgressBar, siteTheme } from './LoadHead';
import { EmailVerification, Navbar } from './Navbar';
import { flag, setting } from '@nativegallery/config';

export { generateMetadata, viewport } from './LoadHead';

export async function SiteLayout({ children }: { children: ReactNode }) {
  const context = await siteContext();
  const title = setting('SITE_TITLE');

  return <html lang="ru" className={narrowFont.variable} data-theme={siteTheme(context.cookie)}>
    <body>
      <ClientNavigation />
      <SiteInteractions />
      <ProgressBar />
      <div id="backgr"></div>
      {flag('EMAIL_VERIFY') && context.viewer?.status === 3 && <EmailVerification />}
      <table className="tmain"><tbody>
        <Navbar title={title} viewer={context.viewer} />
        {children}
        <tr><Footer databaseVersion={context.databaseVersion} /></tr>
      </tbody></table>
    </body>
  </html>;
}
