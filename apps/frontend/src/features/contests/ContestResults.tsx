import { renderToStaticMarkup } from 'react-dom/server';
import type { ContestWinnerData } from '@nativegallery/contracts';

const dates = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', year: 'numeric' });

function ResultLinks() {
  return <p className="narrow" style={{ fontSize: 19 }}>
    <a href="/voting">Голосование</a>&nbsp; · &nbsp;<b>Победители</b>&nbsp; · &nbsp;
    <a href="/voting/rating">Рейтинг</a>&nbsp; · &nbsp;<a href="/voting/waiting">Претенденты</a>
  </p>;
}

function ResultGroup({ winners }: { winners: ContestWinnerData[] }) {
  const first = winners[0];
  return <>
    <p><span className="narrow" style={{ fontSize: 21 }}><b>
      <a href={'#contest-' + first.contestId} title="Результаты конкурса">{dates.format(first.date * 1000)}</a>
    </b></span><br /><span className="sm">{first.theme}</span></p>
    <div style={{ display: 'table', marginInline: 'auto' }} id={'contest-' + first.contestId}>
      {winners.map(winner => <a key={winner.id} href={'/photo/' + winner.photoId + '/'} className="p20"
        style={{ display: 'table-cell', textAlign: 'center', verticalAlign: 'bottom', padding: '20px 20px 10px', fontSize: 17 }}>
        <img src={winner.photoUrl} className="f" style={{ marginBottom: 7 }} alt="" loading="lazy" /><br />
        <img src={'/static/img/vs' + (4 - winner.place) + '.png'} style={{ position: 'relative', top: -2 }}
          alt={winner.place + '-е место'} loading="lazy" /> &nbsp;
      </a>)}
    </div><br />
  </>;
}

export async function ContestResults(api: string) {
  const result = await fetch(api + '/api/contests/results', { cache: 'no-store' }).catch(() => null);
  if (!result?.ok) return new Response('Service Unavailable', { status: 503 });
  const rows: ContestWinnerData[] = await result.json();
  const groups = new Map<number, ContestWinnerData[]>();
  for (const winner of rows) {
    const group = groups.get(winner.contestId);
    if (group) group.push(winner);
    else groups.set(winner.contestId, [winner]);
  }
  const content = renderToStaticMarkup(<tr><td className="main"><div style={{ textAlign: 'center' }}>
    <h1>Победители фотоконкурса</h1><ResultLinks />
    {[...groups].map(([id, winners]) => <ResultGroup key={id} winners={winners} />)}
    <ResultLinks />
  </div></td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body>' +
    '<div id="backgr"></div><table class="tmain">__NAVBAR__' + content +
    '<tr>__FOOTER__</tr></table></body></html>';
}
