'use client';

import { useState, type FormEvent } from 'react';
import { legacyDate, type ProfileSession } from '@nativegallery/contracts';
import { refreshPage } from '../../components/navigation';

const fieldLabel = { marginBottom: 3, marginTop: 5 };
const panel = { textAlign: 'left', marginBottom: 15 } as const;

/** «Безопасность»: password change and the list of signed-in sessions, in the panels and tables of the rest of the site. */
export function ProfileSecurity({ sessions }: { sessions: ProfileSession[] }) {
  const others = sessions.filter(session => !session.current).length;
  return <div style={{ display: 'inline-block', textAlign: 'left', maxWidth: '100%' }}>
    <PasswordForm others={others} />

    <div className="p20" style={panel}>
      <h4>Активные сеансы</h4>
      <p className="sm" style={{ color: '#666', margin: '0 0 10px' }}>
        Устройства, на которых выполнен вход в ваш аккаунт. Если какой-то сеанс вам незнаком, завершите его и смените пароль.
      </p>
      <table style={{ width: '100%' }}><tbody>
        <tr><th>Устройство</th><th>Активность</th><th /></tr>
        {sessions.map((session, index) => <tr key={session.id} className={index % 2 ? 's11' : 's1'}>
          <td className="d" style={{ paddingTop: 5, paddingBottom: 5 }}>
            <b>{session.device || 'Неизвестный браузер'}</b>{session.os && <> · {session.os}</>}
            <div className="sm" style={{ color: '#888', marginTop: 2 }}>
              {session.ip ? 'IP ' + session.ip + ' · ' : ''}вход {legacyDate(session.createdAt)}
            </div>
          </td>
          <td className="ds nw" style={{ verticalAlign: 'middle' }}>{session.current ? 'сейчас' : legacyDate(session.lastActivity)}</td>
          <td className="cs" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
            {session.current
              ? <b style={{ color: 'green' }}>Этот сеанс</b>
              : <form method="post" action={'/api/profile/sessions/' + session.id + '/delete'} style={{ margin: 0 }}>
                <input type="submit" value="Завершить" />
              </form>}
          </td>
        </tr>)}
      </tbody></table>
      {others > 0 && <form method="post" action="/api/profile/sessions/delete-others" style={{ textAlign: 'center', marginTop: 15 }}
        onSubmit={event => { if (!confirm('Завершить все сеансы, кроме этого? На других устройствах нужно будет войти заново.')) event.preventDefault(); }}>
        <input type="submit" style={{ width: 250, height: 30 }} value="Завершить все остальные" />
      </form>}
    </div>
  </div>;
}

function PasswordForm({ others }: { others: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    setError('');
    setSaved(false);
    setPending(true);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>) });
      if (!response.ok) throw new Error();
      const result = await response.text();
      if (result) setError(result);
      else {
        setSaved(true);
        form.reset();
        // Other sessions were signed out, so the list below is out of date.
        if (others) refreshPage();
      }
    } catch {
      setError('Не удалось сменить пароль.');
    } finally {
      setPending(false);
    }
  }

  return <form method="post" action="/api/profile/password" onSubmit={submit} className="p20" style={panel}
    onInput={() => { setError(''); setSaved(false); }}>
    <h4>Смена пароля</h4>
    <div style={fieldLabel}><label htmlFor="current_password">Текущий пароль</label></div>
    <input type="password" name="current_password" id="current_password" autoComplete="current-password" required style={{ width: '100%' }} />
    <div style={fieldLabel}><label htmlFor="new_password">Новый пароль</label></div>
    <input type="password" name="new_password" id="new_password" autoComplete="new-password" required minLength={5} style={{ width: '100%' }} />
    <div style={fieldLabel}><label htmlFor="repeat_password">Повторите новый пароль</label></div>
    <input type="password" name="repeat_password" id="repeat_password" autoComplete="new-password" required minLength={5} style={{ width: '100%' }} />
    <div className="sm" style={{ marginTop: 5, color: '#888' }}>Не короче 5 символов. После смены пароля все остальные сеансы будут завершены.</div>
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <input type="submit" style={{ width: 250, height: 30, marginBottom: 5 }} value={pending ? 'Отправка данных...' : 'Сменить пароль'} disabled={pending} />
      <div role="status">
        {error && <span style={{ color: 'red', fontWeight: 'bold' }}>{error}</span>}
        {saved && <span style={{ fontWeight: 'bold', color: 'green' }}>✔&ensp;Пароль изменён</span>}
      </div>
    </div>
  </form>;
}
