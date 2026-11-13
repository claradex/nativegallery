import { apiGet } from '../../api/client';
import { CommentFeedInteractions } from './CommentFeedInteractions';
import { CommentText } from './CommentText';
import { legacyDate, type CommentFeedEntry } from '@nativegallery/contracts';

export function FeedComment({ comment }: { comment: CommentFeedEntry }) {
  const href = '/photo/' + comment.photoId + '/?top=1';
  const thumbnail = comment.photoUrl.startsWith('/uploads/')
    ? '/api/photo/compress?url=' + encodeURIComponent(comment.photoUrl) : comment.photoUrl;
  const score = comment.positive - comment.negative;
  const role = comment.admin === 1 ? ' · Администратор сервера' : comment.admin === 2 ? ' · Фотомодератор' : '';
  return <div className="p-comment p20p" data-comment-id={comment.id}>
    <div className="pc-photo"><a href={href} target="_blank" className="prw"><img src={thumbnail} className="f" /></a></div>
    <div className="pc-content">
      <a className="pc-topost" href={href + '#' + comment.id} target="_blank">Ссылка</a>
      <div className="pc-text"><div>
        <span className="cmt-aname"><b><a href={'/author/' + comment.authorId + '/'}>{comment.author}</a></b></span> · <span className="sm nw">{legacyDate(comment.postedAt)}</span>
        <div className="rank">Фото: {comment.photoCount}{role}</div>
        <div className="message-text feed"><CommentText body={comment.body} /></div>
      </div></div>
      <div className="pc-compl"><div className="comment-votes-block">
        <div className="wvote" {...{ wid: String(comment.id) }}>
          <a href="#" {...{ vote: '1' }} className="w-btn s2"><span>+</span></a>
          <div className={'w-rating ' + (score > 0 ? 'pro ' : score < 0 ? 'con ' : '') + 'active'}>{score > 0 ? '+' : ''}{score}</div>
          <div className="w-rating-ext"><div><span className="pro">+{comment.positive}</span> / <span className="con">{-comment.negative || 0}</span></div></div>
          <a href="#" {...{ vote: '0' }} className="w-btn s5"><span>–</span></a>
        </div>
      </div></div>
    </div>
  </div>;
}

export async function CommentFeed() {
  const comments = await apiGet<CommentFeedEntry[]>('/api/internal/comment-feed', { error: 'Could not load comments' });
  return <tr><td className="main">
    <h1>Лента комментариев</h1>
    <div id="upd_anchor"></div>
    {comments.map(comment => <FeedComment key={comment.id} comment={comment} />)}
    <div id="scroll_anchor"></div><div id="loader-anchor"></div>
    <CommentFeedInteractions />
  </td></tr>;
}
