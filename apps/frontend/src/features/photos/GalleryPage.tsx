import { type GalleryData } from '@nativegallery/contracts';
import { notFound } from 'next/navigation';

import { PublishedPhoto } from './PublishedPhoto';

export async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) notFound();
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/galleries/' + id, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Could not load this page');
  const data: GalleryData = await response.json();
  return <tr><td className="main">
    <h1>{data.title}</h1>
    {data.photos.map(photo => <PublishedPhoto key={photo.id} photo={photo} />)}
    <div id="scroll_anchor"></div>
  </td></tr>;
}
