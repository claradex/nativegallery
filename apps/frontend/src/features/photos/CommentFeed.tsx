import { apiGet } from '../../api/client';
import { CommentFeedList } from './CommentFeedList';
import type { CommentFeedEntry } from '@nativegallery/contracts';

export async function CommentFeed() {
  const comments = await apiGet<CommentFeedEntry[]>('/api/internal/comment-feed', { error: 'Could not load comments' });
  return <tr><td className="main">
    <h1>Лента комментариев</h1>
    <CommentFeedList initial={comments} />
    <div id="loader-anchor"></div>
  </td></tr>;
}
