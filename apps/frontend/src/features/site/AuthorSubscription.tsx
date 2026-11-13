'use client';

import { useRef, useState } from 'react';

export function AuthorSubscription({ id, signedIn, subscribed, followers }: {
  id: number; signedIn: boolean; subscribed: boolean; followers: number;
}) {
  const [state, setState] = useState({ subscribed, followers });
  const pending = useRef(false);

  async function change() {
    if (pending.current) return;
    pending.current = true;
    try {
      const query = new URLSearchParams({ action: 'subscribe', subj: 'a', id: String(id) });
      const response = await fetch('/api/subscribe?' + query, { cache: 'no-store' });
      if (!response.ok) throw new Error('Subscription rejected');
      const value = await response.text();
      if (value !== '0' && value !== '1') throw new Error('Unexpected subscription status');
      const subscribed = value === '1';
      setState(current => current.subscribed === subscribed ? current : {
        subscribed, followers: Math.max(0, current.followers + (subscribed ? 1 : -1)),
      });
    } catch {
      window.alert('Не удалось изменить подписку.');
    } finally {
      pending.current = false;
    }
  }

  return <div style={{ marginTop: 8 }} data-author-subscription={signedIn ? id : undefined}>
        <div className={'toggle' + (state.subscribed ? ' on' : '')} role="switch" tabIndex={0} aria-label="Подписка"
          aria-checked={state.subscribed} onClick={signedIn ? change : undefined} onKeyDown={signedIn ? event => {
            if (event.key !== ' ' && event.key !== 'Enter') return;
            event.preventDefault();
            void change();
          } : undefined}><div className="handle" /></div>&nbsp;
        <label className="toggle-label" onClick={signedIn ? change : undefined}><b>Подписка на новые фотографии этого автора</b> (подписаны: <b id="subscr_cnt">{state.followers}</b>)</label>
        {!signedIn && <> <a href="/login">Войти</a></>}
      </div>;
}
