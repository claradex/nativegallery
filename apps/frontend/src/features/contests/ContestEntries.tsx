import { EntryForm } from './EntryForm';
import { apiGet } from '../../api/client';

interface Candidate { id: number; url: string; body: string; place: string; views: number }

function Links() {
  return <p className="narrow" style={{ fontSize: 19 }}>
    <a href="/voting">Голосование</a>&nbsp; · &nbsp;<a href="/voting/results">Победители</a>&nbsp; · &nbsp;
    <a href="/voting/rating">Рейтинг</a>&nbsp; · &nbsp;<a href="/voting/waiting">Претенденты</a>
  </p>;
}

function Candidates({ contest, photos }: { contest: number | null; photos: Candidate[] }) {
  return <div style={{ textAlign: 'center' }}>
    <h1>Претенденты на участие в конкурсе</h1><Links />
    {contest === null ? <h2><b>Следующего конкурса нет. Пожалуйста, заходите сюда позже.</b></h2>
      : <><p><a href="/voting/sendpretend">Принять участие в Фотоконкурсе</a></p>
        {photos.map(photo => <div className="p20p" key={photo.id}><table><tbody><tr>
          <td className="pb_photo"><a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
            <img className="f" src={'/api/photo/compress?url=' + encodeURIComponent(photo.url)} alt="" loading="lazy" />
            <div className="hpshade"><div className="eye-icon">{photo.views}</div></div>
          </a></td>
          <td className="pb_descr"><p>{photo.body}</p><p><b className="pw-place">{photo.place}</b></p></td>
        </tr></tbody></table></div>)}
      </>}
    <Links />
  </div>;
}

export async function ContestEntries({ submit }: { submit: boolean }) {
  const data = await apiGet<any>('/api/contests/' + (submit ? 'entry-options' : 'entries'), {
    auth: true, login: true, error: 'Could not load contest data',
  });
  return <tr><td className="main">{submit ? <EntryForm {...data} /> : <Candidates {...data} />}</td></tr>;
}
