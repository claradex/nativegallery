import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface Candidate { id: number; url: string; body: string; place: string; views: number }
interface EntryOptions { contests: { id: number; title: string }[]; photos: { id: number; place: string }[] }

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

function EntryForm({ contests, photos }: EntryOptions) {
  return <>
    <h1>Принять участие в Фотоконкурсе</h1>
    {!contests.length ? <div className="p20">Приём заявок сейчас закрыт.</div> :
      <form id="contest-entry" action="/api/photo/contests/sendpretend" method="post">
        <h4>В каком Фотоконкурсе вы хотите принять участие?</h4>
        <div className="p20w"><table><tbody>
          <tr><th /><th>№</th><th>Тема</th></tr>
          {contests.map((contest, index) => <tr key={contest.id}>
            <td className="ds"><input type="radio" name="cid" value={contest.id} defaultChecked={index === 0} /></td>
            <td className="n">{contest.id}</td><td className="ds">{contest.title}</td>
          </tr>)}
        </tbody></table></div>
        <br /><div className="p20">
          <label htmlFor="photoId">Фотография&nbsp;</label>
          <select id="photoId" name="photo_id" defaultValue="" required>
            <option value="" disabled>Выберите фотографию</option>
            {photos.map(photo => <option key={photo.id} value={photo.id}>{photo.id} — {photo.place}</option>)}
          </select>
          <p><button type="submit" disabled={!photos.length}>Отправить</button></p>
          <p role="status" id="contest-entry-status" />
        </div>
      </form>}
  </>;
}

export async function ContestEntries({ submit }: { submit: boolean }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/contests/' + (submit ? 'entry-options' : 'entries'), {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load contest data');
  const data = await response.json();
  return <tr><td className="main">{submit ? <EntryForm {...data} /> : <Candidates {...data} />}{submit && <script src="/frontend-scripts/ContestEntry.js" defer />}</td></tr>;
}
