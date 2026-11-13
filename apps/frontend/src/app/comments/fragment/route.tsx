import type { CommentFeedEntry } from '@nativegallery/contracts';
import { renderToStaticMarkup } from '../../../components/RenderMarkup';
import { FeedComment } from '../../../features/photos/CommentFeed';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const search = new URLSearchParams();
  for (const key of ['before', 'after']) {
    const value = query.get(key);
    if (value !== null) search.set(key, value);
  }
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/comment-feed?' + search, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 400) return new Response(null, { status: 400 });
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const comments: CommentFeedEntry[] = await response.json();
  return new Response(renderToStaticMarkup(<>{comments.map(comment => <FeedComment key={comment.id} comment={comment} />)}</>), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
