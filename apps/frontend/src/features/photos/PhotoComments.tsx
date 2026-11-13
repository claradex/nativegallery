import { CommentText } from './CommentText';
import { legacyDate, type PhotoCommentData } from '@nativegallery/contracts';

function safeMedia(url: string | null | undefined) {
  if (!url) return undefined;
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
  try {
    return new URL(url).protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

function CommentBody({ body }: { body: string }) {
  const characters = Array.from(body);
  let split = 200;
  const prefix = characters.slice(0, split).join('');
  const partial = /\[\d*\/?[\w-]*$/.exec(prefix)?.[0];
  if (partial && /^\[\d+\/[\w-]+\]/.test(partial + characters.slice(split).join(''))) split -= partial.length;
  return <div className="message-text"><div className="message-text"><div>
    <CommentText body={characters.slice(0, split).join('')} />
    {characters.length > split && <>
      <span className="hidden-text" hidden><CommentText body={characters.slice(split).join('')} /></span>
      <a href="#" className="toggle-message" data-comment-action="expand">показать больше</a>
    </>}
  </div></div></div>;
}

function Comment({ comment, index }: { comment: PhotoCommentData; index: number }) {
  const { id, author, positive, negative, ownVote } = comment;
  const score = positive - negative;
  const attachment = safeMedia(comment.attachmentUrl);
  const style = score > 0 ? ' pro' : score < 0 ? ' con' : '';
  return (
    <div id={String(id)} className={(index % 2 === 0 ? 's1' : 's11') + ' comment'} data-comment-id={id}>
      {comment.pinned && <><i style={{ marginBottom: 1 }}>Комментарий закреплён</i><br /></>}
      <div style={{ float: 'right', textAlign: 'right' }} className="sm">
        <span className="message_date">{legacyDate(comment.postedAt)}</span><br />
        <a href={'#' + id} className="cmLink dot">Ссылка</a>
      </div>
      <div>
        <img src={safeMedia(author?.photourl) ?? '/static/img/avatar.png'} width={32} loading="lazy"
          alt="" data-avatar-fallback style={{ borderRadius: 3, marginRight: 5 }} />
        <b><a href={'/author/' + comment.authorId + '/'} className="message_author">{author?.username}</a></b>{' · '}
        <span className="flag">{comment.edited && <><br />(отредактировано)</>}</span>
      </div>
      <div className="rank">Фото: {comment.publishedPhotos}
        {author?.admin === 1 && ' · Администратор сервера'}
        {author?.admin === 2 && ' · Фотомодератор'}
      </div>
      <CommentBody body={comment.body} />
      {attachment && comment.attachmentType === 'img' &&
        <div className="message-text"><img src={attachment} width={250} alt="" loading="lazy" /></div>}
      {attachment && comment.attachmentType === 'video' &&
        <div className="message-text"><video controls src={attachment} width={250} /></div>}
      <div className="comment-votes-block">
        {(comment.canPin || comment.canEdit) && <div className="dropdown">
          <a style={{ color: '#000' }} className="compl" href="#">...</a>
          <div className="dropdown-content">
            {comment.canPin && <><a href="#" data-comment-action="pin">{comment.pinned ? 'Открепить' : 'Закрепить'}</a><br /></>}
            {comment.canEdit && <>
              <a href="#" style={{ marginBottom: 10 }} data-comment-action="edit" data-comment-body={comment.body}>Редактировать</a><br />
              <a href="#" data-comment-action="delete">Удалить</a>
            </>}
          </div>
        </div>}
        <div className="wvote">
          <a href="#" className={'w-btn s2' + (ownVote === 1 ? ' active' : '')} data-comment-action="vote" data-vote="1"><span>+</span></a>
          <div className={'w-rating' + style + ' active'}>{score > 0 ? '+' : ''}{score}</div>
          <div className="w-rating-ext"><div><span className="pro">+{positive}</span> / <span className="con">{-negative || 0}</span></div></div>
          <a href="#" className={'w-btn s5' + (ownVote === 0 ? ' active' : '')} data-comment-action="vote" data-vote="0"><span>–</span></a>
        </div>
      </div>
    </div>
  );
}

export function PhotoComments({ comments }: { comments: PhotoCommentData[] }) {
  return comments.map((comment, index) => <Comment key={comment.id} comment={comment} index={index} />);
}
