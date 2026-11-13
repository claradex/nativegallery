import { renderToStaticMarkup } from 'react-dom/server';
import type { GalleryData } from '@nativegallery/contracts';
import { PublishedPhoto } from './PublishedPhoto';

export async function FeedPage(api: string) {
  const response = await fetch(api + '/api/internal/feed', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const photos: GalleryData['photos'] = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Лента обновлений</h1>
    <div className="sm" style={{ margin: '-15px 0 5px' }}>Показаны последние 100 фотографий</div><br />
    <div id="upd_anchor"></div>
    {photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} feed />)}
    <div id="scroll_anchor"></div>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
