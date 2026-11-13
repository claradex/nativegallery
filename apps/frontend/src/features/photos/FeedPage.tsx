import type { GalleryData } from '@nativegallery/contracts';
import { PublishedPhoto } from './PublishedPhoto';

export async function FeedPage() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/feed', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load this page');
  const photos: GalleryData['photos'] = await response.json();
  return <tr><td className="main">
    <h1>Лента обновлений</h1>
    <div className="sm" style={{ margin: '-15px 0 5px' }}>Показаны последние 100 фотографий</div><br />
    <div id="upd_anchor"></div>
    {photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} feed />)}
    <div id="scroll_anchor"></div>
  </td></tr>;
}
