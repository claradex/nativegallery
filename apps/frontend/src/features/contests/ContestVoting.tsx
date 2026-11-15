import Link from '../../components/Link';
import { Countdown } from './Countdown';
import { apiGet } from '../../api/client';
import { Ballot, type Candidate } from './Ballot';

type Voting = { contest: null; startsAt: number | null }
  | { contest: number; signedIn: boolean; voters: number; votes: number; photos: Candidate[] };

export async function ContestVoting() {
  const data = await apiGet<Voting>('/api/contests/voting', { auth: true, error: 'Could not load contest data' });
  return <tr><td className="main"><div className="center">
    <h1>Фотоконкурс</h1>
    <p className="narrow" style={{ fontSize: 19 }}><b>Голосование</b>&nbsp; · &nbsp;
      <Link href="/voting/results">Победители</Link>&nbsp; · &nbsp;<Link href="/voting/rating">Рейтинг</Link>&nbsp; · &nbsp;
      <Link href="/voting/waiting">Претенденты</Link>
    </p>
    <div style={{ marginTop: 20 }}>Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br /><br />
    {data.contest === null ? <>
      <div className="p20"><h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4></div>
      {data.startsAt && <><h2>Следующий Фотоконкурс будет через:</h2><Countdown as="h1" until={data.startsAt} /></>}
    </> : <Ballot {...data} />}
  </div></td></tr>;
}
