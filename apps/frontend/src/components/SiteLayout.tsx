import { SiteInteractions } from './SiteInteractions';
import type { ReactNode } from 'react';
import { siteContext } from '../features/site/SiteContext';
import { narrowFont } from '../styles/fonts';
import { Footer } from './Footer';
import { ProgressBar, siteTheme } from './LoadHead';
import { EmailVerification, Navbar } from './Navbar';

export { generateMetadata, viewport } from './LoadHead';

export async function SiteLayout({ children, photo = false }: { children: ReactNode; photo?: boolean }) {
  const context = await siteContext();
  const title = process.env.SITE_TITLE ?? 'NativeGallery';

  return <html lang="ru" className={narrowFont.variable} data-theme={siteTheme(context.cookie)}>
    <body>
      <SiteInteractions />
      <ProgressBar />
      <div id="backgr"></div>
      {process.env.EMAIL_VERIFY === 'true' && context.viewer?.status === 3 && <EmailVerification />}
      <table className="tmain"><tbody>
        <Navbar path={photo ? "/photo" : "/"} title={title} viewer={context.viewer} />
        {children}
        <tr><Footer databaseVersion={context.databaseVersion} /></tr>
      </tbody></table>
    </body>
  </html>;
}
