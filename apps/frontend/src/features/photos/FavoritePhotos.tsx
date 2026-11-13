import type { TopPhoto } from '@nativegallery/contracts';
import { renderToStaticMarkup } from '../../components/RenderMarkup';
import { PublishedPhoto } from './PublishedPhoto';

export async function FavoritePhotos(request: Request, api: string) {
  const response = await fetch(api + '/api/internal/favorite-photos', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const photos: TopPhoto[] = await response.json();
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    renderToStaticMarkup(<tr><td className="main">
      <h1>Избранные фотографии</h1>
      {photos.map(({ timeupload, ...photo }) => <PublishedPhoto key={photo.id} photo={{ ...photo, uploadedAt: timeupload, postedAt: timeupload }} />)}
      <div id="scroll_anchor"></div>
    </td></tr>) +
    '<tr>__FOOTER__</tr></table></body></html>';
}
