'use client';

import { useRef, useState } from 'react';
import { legacyDate } from '@nativegallery/contracts';

export interface Candidate {
  id: number; url: string; place: string; body: string; date: number;
  authorId: number; author: string; views: number; voted: boolean;
}

function CandidateRow({ photo, signedIn, vote, voted }: { photo: Candidate; signedIn: boolean; vote: (id: number) => void; voted: boolean }) {
  return <div className="p20p"><table><tbody><tr>
    <td><a href={signedIn ? '#' : '/login'} data-contest-photo={signedIn ? photo.id : undefined}
      aria-label="Голосовать за фотографию" className={'contestBtn' + (voted ? ' voted' : '')}
      onClick={signedIn ? event => { event.preventDefault(); vote(photo.id); } : undefined} /></td>
    <td className="pb_photo"><a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
      <img className="f" src={'/api/photo/compress?url=' + encodeURIComponent(photo.url)} alt="630 КБ" loading="lazy" />
      <div className="hpshade"><div className="eye-icon">{photo.views}</div></div>
    </a></td>
    <td className="pb_descr"><p>{photo.body}</p><p><b className="pw-place">{photo.place}</b></p>
      <p className="sm"><b>{legacyDate(photo.date)}</b><br />Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a></p>
    </td>
  </tr></tbody></table></div>;
}

export function Ballot({ contest, photos, signedIn, voters, votes }: {
  contest: number; photos: Candidate[]; signedIn: boolean; voters: number; votes: number;
}) {
  const pending = useRef(false);
  const [selection, setSelection] = useState<Partial<Record<number, boolean>>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function vote(id: number) {
    if (pending.current) return;
    pending.current = true;
    const query = new URLSearchParams({ action: 'vote-contest', pid: String(id), kid: String(contest) });
    try {
      const response = await fetch('/api/photo/contests/rate?' + query, { cache: 'no-store' });
      if (!response.ok) throw new Error('Vote rejected');
      const [updated, text]: [Record<number, number>, string] = await response.json();
      setSelection(current => ({ ...current, [id]: updated[id] === 1 }));
      setMessage(text);
    } catch {
      setMessage('Не удалось сохранить голос.');
    } finally {
      pending.current = false;
    }
  }

  return <div data-contest={contest}>
      <div id="tip" role="status">{message ?? <span id="img" />}</div>
      {photos.map(photo => <CandidateRow key={photo.id} photo={photo} signedIn={signedIn} vote={vote} voted={selection[photo.id] ?? photo.voted} />)}
      <br />Число проголосовавших: <b>{voters}</b><br />Число голосов: <b>{votes}</b><br /><br />
    </div>;
}
