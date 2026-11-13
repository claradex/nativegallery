'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { legacyDate, type CommentFeedEntry } from '@nativegallery/contracts';
import { CommentText } from './CommentText';

const pageSize = 30;

function CommentVote({ id, positive: initialPositive, negative: initialNegative }: { id: number; positive: number; negative: number }) {
  const [counts, setCounts] = useState([initialNegative, initialPositive]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const score = counts[1] - counts[0];

  async function vote(event: MouseEvent, value: '0' | '1') {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch('/api/photo/comment/rate?' + new URLSearchParams({ wid: String(id), vote: value }), { cache: 'no-store' });
      if (response.status === 403) return window.location.assign('/login');
      if (!response.ok) return;
      const [nextSelected, nextCounts] = await response.json();
      setSelected(nextSelected);
      setCounts([nextCounts[0], nextCounts[1]]);
    } catch {
      // Keep the current totals when the request fails.
    } finally {
      setPending(false);
    }
  }

  return <div className="wvote" {...{ wid: String(id) }}>
    <a href="#" data-vote="1" className={'w-btn s2' + (selected[1] ? ' active' : '')} onClick={event => vote(event, '1')}><span>+</span></a>
    <div className={'w-rating ' + (score > 0 ? 'pro ' : score < 0 ? 'con ' : '') + 'active'}>{score > 0 ? '+' : ''}{score}</div>
    <div className="w-rating-ext"><div><span className="pro">+{counts[1]}</span> / <span className="con">{-counts[0] || 0}</span></div></div>
    <a href="#" data-vote="0" className={'w-btn s5' + (selected[0] ? ' active' : '')} onClick={event => vote(event, '0')}><span>–</span></a>
  </div>;
}

function FeedComment({ comment }: { comment: CommentFeedEntry }) {
  const href = '/photo/' + comment.photoId + '/?top=1';
  const thumbnail = comment.photoUrl.startsWith('/uploads/')
    ? '/api/photo/compress?url=' + encodeURIComponent(comment.photoUrl) : comment.photoUrl;
  const role = comment.admin === 1 ? ' · Администратор сервера' : comment.admin === 2 ? ' · Фотомодератор' : '';
  return <div className="p-comment p20p" data-comment-id={comment.id}>
    <div className="pc-photo"><a href={href} target="_blank" className="prw"><img src={thumbnail} className="f" /></a></div>
    <div className="pc-content">
      <a className="pc-topost" href={href + '#' + comment.id} target="_blank">Ссылка</a>
      <div className="pc-text"><div>
        <span className="cmt-aname"><b><a href={'/author/' + comment.authorId + '/'}>{comment.author}</a></b></span> · <span className="sm nw">{legacyDate(comment.postedAt)}</span>
        <div className="rank">Фото: {comment.photoCount}{role}</div>
        <div className="message-text feed"><CommentText body={comment.body} /></div>
      </div></div>
      <div className="pc-compl"><div className="comment-votes-block">
        <CommentVote id={comment.id} positive={comment.positive} negative={comment.negative} />
      </div></div>
    </div>
  </div>;
}

async function readComments(direction: 'before' | 'after', cursor: number, signal: AbortSignal): Promise<CommentFeedEntry[]> {
  const response = await fetch('/api/internal/comment-feed?' + new URLSearchParams({ [direction]: String(cursor) }), { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Unable to load comments');
  return response.json();
}

/** Newest comments first: polls for newer ones and pages older ones in as the end of the list scrolls into view. */
export function CommentFeedList({ initial }: { initial: CommentFeedEntry[] }) {
  const [comments, setComments] = useState(initial);
  const [exhausted, setExhausted] = useState(initial.length < pageSize);
  const end = useRef<HTMLDivElement>(null);
  const latest = useRef(comments);
  latest.current = comments;

  useEffect(() => {
    const events = new AbortController();
    let loading = false;
    const timer = window.setInterval(async () => {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const newer = await readComments('after', latest.current[0]?.id ?? 0, events.signal);
        if (newer.length) setComments(current => [...newer, ...current]);
      } catch {
        // The next interval retries with the same cursor.
      } finally {
        loading = false;
      }
    }, 30_000);
    return () => { events.abort(); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (exhausted || !end.current) return;
    const events = new AbortController();
    let loading = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      const oldest = latest.current.at(-1)?.id;
      if (!entry.isIntersecting || loading || oldest === undefined) return;
      loading = true;
      try {
        const older = await readComments('before', oldest, events.signal);
        setComments(current => [...current, ...older]);
        if (older.length < pageSize) setExhausted(true);
      } catch {
        // A later scroll retries.
      } finally {
        loading = false;
      }
    });
    observer.observe(end.current);
    return () => { events.abort(); observer.disconnect(); };
  }, [exhausted]);

  return <>
    {comments.map(comment => <FeedComment key={comment.id} comment={comment} />)}
    <div id="scroll_anchor" ref={end}></div>
  </>;
}
