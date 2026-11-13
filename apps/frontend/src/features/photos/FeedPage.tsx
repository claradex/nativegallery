import { apiGet } from '../../api/client';
import type { GalleryData } from '@nativegallery/contracts';
import { PublishedPhoto } from './PublishedPhoto';

export async function FeedPage() {
  const photos = await apiGet<GalleryData['photos']>('/api/internal/feed');
  return <tr><td className="main">
    <h1>Лента обновлений</h1>
    <div className="sm" style={{ margin: '-15px 0 5px' }}>Показаны последние 100 фотографий</div><br />
    <div id="upd_anchor"></div>
    {photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} feed />)}
    <div id="scroll_anchor"></div>
  </td></tr>;
}
