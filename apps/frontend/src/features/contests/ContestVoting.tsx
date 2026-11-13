import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate } from '@nativegallery/contracts';

interface Candidate {
  id: number; url: string; place: string; body: string; date: number;
  authorId: number; author: string; views: number; voted: boolean;
}
type Voting = { contest: null; startsAt: number | null }
  | { contest: number; signedIn: boolean; voters: number; votes: number; photos: Candidate[] };

function CandidateRow({ photo, signedIn }: { photo: Candidate; signedIn: boolean }) {
  return <div className="p20p"><table><tbody><tr>
    <td><a href={signedIn ? '#' : '/login'} data-contest-photo={signedIn ? photo.id : undefined}
      aria-label="Голосовать за фотографию" className={'contestBtn' + (photo.voted ? ' voted' : '')} /></td>
    <td className="pb_photo"><a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
      <img className="f" src={'/api/photo/compress?url=' + encodeURIComponent(photo.url)} alt="630 КБ" loading="lazy" />
      <div className="hpshade"><div className="eye-icon">{photo.views}</div></div>
    </a></td>
    <td className="pb_descr"><p>{photo.body}</p><p><b className="pw-place">{photo.place}</b></p>
      <p className="sm"><b>{legacyDate(photo.date)}</b><br />Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a></p>
    </td>
  </tr></tbody></table></div>;
}

export async function ContestVoting(request: Request, api: string) {
  const response = await fetch(api + '/api/contests/voting', {
    cache: 'no-store', headers: { cookie: request.headers.get('cookie') ?? '' },
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const data: Voting = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main"><div style={{ textAlign: 'center' }}>
    <h1>Фотоконкурс</h1>
    <p className="narrow" style={{ fontSize: 19 }}><b>Голосование</b>&nbsp; · &nbsp;
      <a href="/voting/results">Победители</a>&nbsp; · &nbsp;<a href="/voting/rating">Рейтинг</a>&nbsp; · &nbsp;
      <a href="/voting/waiting">Претенденты</a>
    </p>
    <div style={{ marginTop: 20 }}>Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br /><br />
    {data.contest === null ? <>
      <div className="p20"><h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4></div>
      {data.startsAt && <><h2>Следующий Фотоконкурс будет через:</h2><h1 id="countdown" />{'__SCRIPT_ContestVoting:' + data.startsAt + '__'}</>}
    </> : <div data-contest={data.contest}>
      <div id="tip" role="status"><span id="img" /></div>
      {data.photos.map(photo => <CandidateRow key={photo.id} photo={photo} signedIn={data.signedIn} />)}
      <br />Число проголосовавших: <b>{data.voters}</b><br />Число голосов: <b>{data.votes}</b><br /><br />
    </div>}
  </div></td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">' +
    '__NAVBAR__' + content + '<tr>__FOOTER__</tr></table>__SCRIPT_ContestBallot__</body></html>';
}
