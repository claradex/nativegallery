'use client';

import { useEffect, useState } from 'react';
import { Countdown } from '../contests/Countdown';

interface Contest {
  status: number;
  theme: string;
  closedate: number;
  closepretendsdate: number;
}

export function HomeContest({ contest, title }: { contest: Contest; title: string }) {
  const [transitionedClose, setTransitionedClose] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const voting = contest.status === 2 || transitionedClose !== null;
  const linkStyle = { backgroundColor: '#37009D', color: '#fff' };

  useEffect(() => {
    if (voting || !Number.isFinite(contest.closepretendsdate)) return;
    const request = new AbortController();
    let timer: number;
    async function check() {
      if (Date.now() >= contest.closepretendsdate * 1000) {
        setWaiting(true);
        try {
          const response = await fetch('/api/contests/getinfo', { cache: 'no-store', signal: request.signal });
          if (response.ok) {
            const { statuses, contest: current } = await response.json();
            if (!request.signal.aborted && statuses?.pretends === 'closed' && statuses.public === 'opened' && current?.closedate) {
              setTransitionedClose(Number(current.closedate));
              return;
            }
          }
        } catch (error) {
          if (!request.signal.aborted) console.error(error);
        }
      }
      if (!request.signal.aborted) timer = window.setTimeout(check, 1000);
    }
    timer = window.setTimeout(check, 1000);
    return () => {
      request.abort();
      window.clearTimeout(timer);
    };
  }, [contest.closepretendsdate, voting]);

  return <div id="contestNotify" style={{ float: 'left', border: 'solid 1px #171022', padding: '6px 10px 7px',
    marginBottom: 13, backgroundColor: '#E5D6FF' }}>
    <h4>Фотоконкурс!</h4>
    <span id="timett">{voting ? 'Закончится через:' : 'Начнётся через:'}</span>{' '}
    {voting ? <Countdown as="b" until={transitionedClose ?? contest.closedate} />
      : <b id="countdown">{waiting ? 'Ожидаем ответ от сервера...' : ''}</b>}<br />
    Тематика: <b>{contest.theme}</b><br />
    <b id={contest.status === 2 ? undefined : 'textContest'} style={{ color: '#412378' }}>{voting
      ? 'Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!'
      : 'Лучшие фотографии по мнению сообщества ' + title + ' будут отмечены'}</b>
    <br /><br />
    <div id="contestBtns">{voting
      ? <a href="/voting" style={linkStyle} type="button">Голосовать!</a>
      : <><a href="/voting/sendpretend" style={linkStyle} type="button">Участвовать!</a>{' '}
        <a href="/voting/waiting" style={linkStyle} type="button">Голосовать за претендентов</a></>}
    </div>
  </div>;
}
