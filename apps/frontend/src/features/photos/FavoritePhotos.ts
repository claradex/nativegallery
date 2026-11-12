import { legacyDate, type TopPhoto } from '@nativegallery/contracts';
import { escapeHtml } from '../../components/Html';
import { readTemplate } from '../../components/ReadTemplate';

const page = readTemplate('src/features/photos/FavoritePhotos.html');
const row = readTemplate('src/features/photos/FavoritePhoto.html');

export async function FavoritePhotos(request: Request, api: string) {
  const response = await fetch(api + '/api/internal/favorite-photos', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const photos: TopPhoto[] = await response.json();
  const entries = photos.map(photo => {
    const values: Record<string, string> = {
      ID: String(photo.id), URL: encodeURIComponent(photo.photourl), VIEWS: String(photo.views),
      BODY: escapeHtml(photo.postbody), PLACE: escapeHtml(photo.place), DATE: legacyDate(photo.timeupload),
      AUTHOR_ID: String(photo.authorId), AUTHOR: escapeHtml(photo.author),
    };
    return row.replaceAll(/__([A-Z_]+)__/g, (_, field) => values[field] ?? '');
  });
  return page.replace('__FAVORITES__', () => entries.join(''));
}
