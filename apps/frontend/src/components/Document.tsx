import { renderToStaticMarkup } from 'react-dom/server';
import { PageScripts } from './PageScripts';
import { Footer } from './Footer';
import { LoadHead } from './LoadHead';
import { Navbar } from './Navbar';
import type { Viewer } from '@nativegallery/contracts';

export interface PageContext { viewer: Viewer | null; databaseVersion: string }

export function Document(request: Request, page: string, context: PageContext, status = 200) {
  const path = new URL(request.url).pathname;
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  const parts: Record<string, string> = {
    HEAD: renderToStaticMarkup(<LoadHead title={title} cookie={request.headers.get('cookie')} />),
    NAVBAR: renderToStaticMarkup(<Navbar path={path} title={title} viewer={context.viewer} />),
    FOOTER: renderToStaticMarkup(<Footer databaseVersion={context.databaseVersion} />),
  };
  return new Response(PageScripts(page.replaceAll(/__(HEAD|NAVBAR|FOOTER)__/g, (_, key) => parts[key])), {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
