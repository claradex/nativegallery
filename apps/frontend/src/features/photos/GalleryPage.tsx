import { renderToStaticMarkup } from '../../components/RenderMarkup';
import { type GalleryData } from '@nativegallery/contracts';
import { NotFound } from '../site/StaticPages';

import { PublishedPhoto } from './PublishedPhoto';

export async function GalleryPage(request: Request, api: string, id: string) {
  const response = await fetch(api + '/api/internal/galleries/' + id, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 404) return NotFound(request);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const data: GalleryData = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>{data.title}</h1>
    {data.photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} />)}
    <div id="scroll_anchor"></div>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
