import Link from '../../components/Link';
import type { ReactNode } from 'react';
import type { PhotoPageData } from '@nativegallery/contracts';

function mediaUrl(value: string | null) {
  if (!value || value.includes('\\') || /[\u0000-\u0020]/.test(value)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { return ['https:', 'http:'].includes(new URL(value).protocol) ? value : undefined; } catch { return undefined; }
}

/** The arrow is a plain anchor without an href at either end of the sequence. */
function PhotoStep({ rel, label, photoId, scope, children }: { rel: 'prev' | 'next'; label: string; photoId: number | null; scope: string; children: ReactNode }) {
  const props = { id: rel, rel, 'aria-label': label, 'aria-disabled': !photoId };
  return photoId ? <Link {...props} href={'/photo/' + photoId + '/' + scope}>{children}</Link> : <a {...props}>{children}</a>;
}

export function PhotoMedia({ photo, scope }: { photo: PhotoPageData; scope: string }) {
  const video = mediaUrl(photo.videoUrl);
  const image = mediaUrl(photo.url);
  return <div className="center">
    <div id="photobar">
      <PhotoStep rel="prev" label="Предыдущая фотография" photoId={photo.previousId} scope={scope}><span>&lt;</span></PhotoStep>
      <PhotoStep rel="next" label="Следующая фотография" photoId={photo.nextId} scope={scope}><span>&gt;</span></PhotoStep>
      <div style={{ display: 'inline-block' }}>
        <div id="underphoto_frame"><div id="ph_frame">
          {video ? <video controls><source src={video} /></video> : <a href={image}>
            <img id="ph" src={image} alt="" title="Фотография" loading="lazy" />
          </a>}
          {photo.contestEntry && <Link className="underphoto" href="/voting">
            <img style={{ marginTop: -4 }} src="/static/img/star_people.png" alt="" loading="lazy" />
            {'  Фотография участвует в голосовании'}
          </Link>}
          {photo.contestPlaces.map((place, index) => <Link key={index} className="underphoto"
            style={{ fontWeight: 'bold' }} href="/voting/results">
            <img style={{ marginTop: -4 }} src={'/static/img/vs' + (4 - place) + '.png'} alt="" loading="lazy" />
            {'  '}{place}-е место на фотоконкурсе
          </Link>)}
          {photo.priority === 1 && <div className="underphoto s17" style={{ cursor: 'help' }}
            title="Фотография не удовлетворяет действующим на момент публикации критериям качества снимков.">
            <i className="fas fa-info-circle" style={{ position: 'relative', top: 1 }} />&ensp;<b className="dot">Условная публикация</b>
          </div>}
          {photo.priority === 2 && <div className="underphoto s19" style={{ cursor: 'help' }}
            title="Изображение будет удалено с сайта через некоторое время">
            <i className="fas fa-clock" style={{ position: 'relative', top: 1 }} />&ensp;<b className="dot">Временная публикация</b>
          </div>}
        </div></div>
      </div>
    </div>
  </div>;
}
