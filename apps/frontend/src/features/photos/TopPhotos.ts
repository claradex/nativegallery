import { legacyDate, type TopPhoto } from '@nativegallery/contracts';
import { escapeHtml } from '../../components/Html';
import { readTemplate } from '../../components/ReadTemplate';

export async function TopPhotos(api: string) {
  const response = await fetch(api + '/api/internal/top30', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return null;
  const photos: TopPhoto[] = await response.json();
  const row = readTemplate('src/features/photos/TopPhoto.html');
  const entries = photos.map((photo, index) => {
    const values: Record<string, string> = {
      RANK: String(index + 1), VIEWS: String(photo.views), ID: String(photo.id),
      URL: escapeHtml(photo.photourl), PLACE: escapeHtml(photo.place),
      DESCRIPTION: escapeHtml(photo.postbody), DATE: legacyDate(photo.timeupload),
      AUTHOR_ID: String(photo.authorId), AUTHOR: escapeHtml(photo.author),
    };
    return row.replaceAll(/__([A-Z_]+)__/g, (_, field) => values[field] ?? '');
  }).join('');
  return readTemplate('src/features/photos/TopPhotos.html').replace('__ENTRIES__', () => entries);
}
