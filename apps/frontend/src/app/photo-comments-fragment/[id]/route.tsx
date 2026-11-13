import type { PhotoCommentData } from '@nativegallery/contracts';
import { renderToStaticMarkup } from '../../../components/RenderMarkup';
import { PhotoComments } from '../../../features/photos/PhotoComments';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) return new Response(null, { status: 404 });
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/legacy-photo-comments/' + id, {
    cache: 'no-store', headers: { cookie: request.headers.get('cookie') ?? '' },
  }).catch(() => null);
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' };
  if (response?.status === 403 || response?.status === 404) {
    return new Response(null, { status: response.status, headers });
  }
  if (!response?.ok) return new Response('Service Unavailable', { status: 503, headers });
  const comments: PhotoCommentData[] = await response.json();
  return new Response(renderToStaticMarkup(<PhotoComments comments={comments} />), { headers });
}
