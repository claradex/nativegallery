'use client';

import { useState, type FormEvent } from 'react';

interface EntryOptions { contests: { id: number; title: string }[]; photos: { id: number; place: string }[] }

export function EntryForm({ contests, photos }: EntryOptions) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !photos.length) return;
    const form = event.currentTarget;
    const body = new URLSearchParams();
    for (const [key, value] of new FormData(form)) body.append(key, String(value));
    setPending(true);
    try {
      const response = await fetch(form.action, { method: 'POST', body });
      if (!response.ok || (await response.json()).errorcode !== 0) throw new Error('Contest entry rejected');
      window.location.assign('/voting/waiting');
    } catch {
      setError('Не удалось отправить фотографию на конкурс.');
      setPending(false);
    }
  }

  return <>
    <h1>Принять участие в Фотоконкурсе</h1>
    {!contests.length ? <div className="p20">Приём заявок сейчас закрыт.</div> :
      <form id="contest-entry" action="/api/photo/contests/sendpretend" method="post" onSubmit={submit}>
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
          <p><button type="submit" disabled={pending || !photos.length}>Отправить</button></p>
          <p role="status" id="contest-entry-status">{error}</p>
        </div>
      </form>}
  </>;
}
