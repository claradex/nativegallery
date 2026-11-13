'use client';

import { useEffect, useRef, useState } from 'react';

interface Photo {
  id: number;
  place: string;
  date: string;
  photourl_small: string;
  photourl_extrasmall: string;
  ccnt: number;
}

interface Tile extends Photo {
  full: string;
  tiny: string;
}

function RecentPhoto({ photo }: { photo: Tile }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const image = new Image();
    image.onload = () => setLoaded(true);
    image.src = photo.full;
    return () => { image.onload = null; };
  }, [photo.full]);

  return <div className="prw-grid-item">
    <div className="prw-wrapper">{photo.place}<div>{photo.date}</div></div>
    <a href={'/photo/' + Number(photo.id) + '/'} target="_blank"
      className={'prw-animate blur-load' + (loaded ? ' loaded' : '')} data-src={photo.full}
      style={{ backgroundImage: 'url(' + JSON.stringify(loaded ? photo.full : photo.tiny) + ')' }}>
      {Number(photo.ccnt) > 0 && <div className="hdshade"><div className="com-icon">{photo.ccnt}</div></div>}
    </a>
  </div>;
}

export function RecentPhotos({ lastId, firstId }: { lastId: number; firstId?: number }) {
  const cursor = useRef(lastId);
  const [photos, setPhotos] = useState<Tile[]>([]);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    async function load() {
      setPending(true);
      try {
        const query = new URLSearchParams({ lastpid: String(cursor.current) });
        const response = await fetch('/api/photo/loadrecent?' + query, { signal: request.signal });
        if (!response.ok) throw new Error('Unable to load photos');
        const batch: Photo[] = await response.json();
        if (!Array.isArray(batch)) throw new Error('Unexpected photo list');
        if (request.signal.aborted) return;
        const last = batch.at(-1);
        if (!last) {
          setExhausted(true);
          return;
        }
        const tiles = batch.map(photo => ({
          ...photo,
          place: new DOMParser().parseFromString(photo.place, 'text/html').body.textContent ?? '',
          full: new URL(photo.photourl_small, location.origin).href,
          tiny: new URL(photo.photourl_extrasmall, location.origin).href,
        }));
        cursor.current = last.id;
        setPhotos(current => [...current, ...tiles]);
      } catch (error) {
        if (!request.signal.aborted) console.error(error);
      } finally {
        if (!request.signal.aborted) setPending(false);
      }
    }
    void load();
    return () => request.abort();
  }, [page]);

  return <>
    <div id="recent-photos" className="ix-photos ix-photos-multiline shine"
      {...{ lastpid: String(photos.at(-1)?.id ?? lastId), firstpid: String(firstId ?? '') }}>
      {photos.map(photo => <RecentPhoto key={photo.id} photo={photo} />)}
    </div>
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <input type="button" name="button" id="loadmore" className={pending ? 'loader-button' : ''}
        value={pending ? ' ' : 'Загрузить ещё'} disabled={pending} hidden={exhausted}
        onClick={() => setPage(current => current + 1)} />
    </div>
  </>;
}
