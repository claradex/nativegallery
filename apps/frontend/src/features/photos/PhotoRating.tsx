import type { PhotoPageData } from '@nativegallery/contracts';

export function PhotoRating({ photo }: { photo: PhotoPageData }) {
  const rating = photo.rating;
  if (!rating) return null;
  return <div className="p20a" id="pp-item-vote">
    <h4 className="pp-item-header">Оценка</h4>
    <div className="sm">
      <div className="rtext">Рейтинг: <b id="rating">{rating.total}</b></div>
      <div className="star" />
      {photo.canComment && <div className="vote" data-photo-vote={photo.id} data-contest-id={rating.contest?.id}>
        <a href="#" data-vote="1" className={'vote_btn' + (rating.current === 1 ? ' voted' : '')}><span>Интересная фотография!</span></a>
        <a href="#" data-vote="0" className={'vote_btn' + (rating.current === 0 ? ' voted' : '')}><span>Мне не&nbsp;нравится</span></a>
        {rating.contest && <>
          <a href="#" data-vote="1" className={'konk_btn' + (rating.contest.current === 1 ? ' voted' : '')}><span>Красиво, на&nbsp;конкурс!</span></a>
          <a href="#" data-vote="0" className={'konk_btn' + (rating.contest.current === 0 ? ' voted' : '')}><span>Неконкурсное фото</span></a>
        </>}
      </div>}
    </div>
    <div id="votes" className="votes">
      {([1, 0] as const).map(type => <table key={type} className={'vblock ' + (type === 1 ? 'pro' : 'coN')}>
        <tbody>{rating.votes.filter(vote => vote.type === type).map(vote =>
          <tr key={vote.id}><td><a href={'/author/' + vote.authorId + '/'}>{vote.author}</a></td>
            <td className="vv">{type === 1 ? '+1' : '-1'}</td></tr>)}</tbody>
      </table>)}
    </div>
  </div>;
}
