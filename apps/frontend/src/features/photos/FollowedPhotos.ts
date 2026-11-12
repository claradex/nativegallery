import { legacyDate, type TopPhoto } from '@nativegallery/contracts';
import { escapeHtml } from '../../components/Html';
import { readTemplate } from '../../components/ReadTemplate';

const directory = 'src/features/photos/';
const page = readTemplate(directory + 'FollowedPhotos.html');
const row = readTemplate(directory + 'FollowedPhoto.html');

export async function FollowedPhotos(request: Request, api: string) {
  const response = await fetch(api + '/api/internal/followed-photos', {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });

  const photos: TopPhoto[] = await response.json();
  const notice = readTemplate(directory + (photos.length ? 'FollowedMarkRead.html' : 'FollowedEmpty.html'));
  const entries = photos.map(photo => {
    const fields: Record<string, string> = {
      ID: String(photo.id), URL: escapeHtml(photo.photourl), VIEWS: String(photo.views),
      PLACE: escapeHtml(photo.place), BODY: escapeHtml(photo.postbody), DATE: legacyDate(photo.timeupload),
      AUTHOR_ID: String(photo.authorId), AUTHOR: escapeHtml(photo.author),
    };
    return row.replaceAll(/__([A-Z_]+)__/g, (_, field) => fields[field] ?? '');
  });
  return page.replace('__NOTIFICATIONS__', () => notice + entries.join(''));
}
