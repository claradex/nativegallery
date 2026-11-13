import { Countdown } from './Countdown';
import { headers } from 'next/headers';
import { Ballot, type Candidate } from './Ballot';

type Voting = { contest: null; startsAt: number | null }
  | { contest: number; signedIn: boolean; voters: number; votes: number; photos: Candidate[] };

export async function ContestVoting() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/contests/voting', {
    cache: 'no-store', headers: { cookie: (await headers()).get('cookie') ?? '' },
  }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load contest data');
  const data: Voting = await response.json();
  return <tr><td className="main"><div style={{ textAlign: 'center' }}>
    <h1>Фотоконкурс</h1>
    <p className="narrow" style={{ fontSize: 19 }}><b>Голосование</b>&nbsp; · &nbsp;
      <a href="/voting/results">Победители</a>&nbsp; · &nbsp;<a href="/voting/rating">Рейтинг</a>&nbsp; · &nbsp;
      <a href="/voting/waiting">Претенденты</a>
    </p>
    <div style={{ marginTop: 20 }}>Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br /><br />
    {data.contest === null ? <>
      <div className="p20"><h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4></div>
      {data.startsAt && <><h2>Следующий Фотоконкурс будет через:</h2><Countdown as="h1" until={data.startsAt} /></>}
    </> : <Ballot {...data} />}
  </div></td></tr>;
}
