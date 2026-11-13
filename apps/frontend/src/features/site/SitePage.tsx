import { renderToStaticMarkup } from 'react-dom/server';
import type { SitePageData } from '@nativegallery/contracts';
import { NotFound } from './StaticPages';

export async function SitePage(request: Request, api: string, id: string) {
  const response = await fetch(api + '/api/internal/pages/' + id, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 404) return NotFound(request);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const page: SitePageData = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>{page.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: page.html }} />
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
