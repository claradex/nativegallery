import type { TopPhoto } from '@nativegallery/contracts';
import { apiGet } from '../../api/client';
import { PublishedPhoto } from './PublishedPhoto';

export async function FavoritePhotos() {
  const photos = await apiGet<TopPhoto[]>('/api/internal/favorite-photos', {
    auth: true, login: true, error: 'Could not load saved photos',
  });
  return <tr><td className="main">
      <h1>Избранные фотографии</h1>
      {photos.map(({ timeupload, ...photo }) => <PublishedPhoto key={photo.id} photo={{ ...photo, uploadedAt: timeupload, postedAt: timeupload }} />)}
      <div id="scroll_anchor"></div>
    </td></tr>;
}
