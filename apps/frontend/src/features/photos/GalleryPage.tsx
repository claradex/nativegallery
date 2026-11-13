import { type GalleryData } from '@nativegallery/contracts';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';

import { PublishedPhoto } from './PublishedPhoto';

export async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) notFound();
  const data = await apiGet<GalleryData>('/api/internal/galleries/' + id, { missing: true });
  return <tr><td className="main">
    <h1>{data.title}</h1>
    {data.photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} />)}
    <div id="scroll_anchor"></div>
  </td></tr>;
}
