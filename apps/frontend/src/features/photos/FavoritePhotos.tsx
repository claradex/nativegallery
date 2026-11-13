import type { TopPhoto } from '@nativegallery/contracts';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PublishedPhoto } from './PublishedPhoto';

export async function FavoritePhotos() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/favorite-photos', {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load saved photos');
  const photos: TopPhoto[] = await response.json();
  return <tr><td className="main">
      <h1>Избранные фотографии</h1>
      {photos.map(({ timeupload, ...photo }) => <PublishedPhoto key={photo.id} photo={{ ...photo, uploadedAt: timeupload, postedAt: timeupload }} />)}
      <div id="scroll_anchor"></div>
    </td></tr>;
}
