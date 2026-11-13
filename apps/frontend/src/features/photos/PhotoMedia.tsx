import type { PhotoPageData } from '@nativegallery/contracts';

function mediaUrl(value: string | null) {
  if (!value || value.includes('\\') || /[\u0000-\u0020]/.test(value)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { return ['https:', 'http:'].includes(new URL(value).protocol) ? value : undefined; } catch { return undefined; }
}

export function PhotoMedia({ photo, scope }: { photo: PhotoPageData; scope: string }) {
  const video = mediaUrl(photo.videoUrl);
  const image = mediaUrl(photo.url);
  return <div style={{ textAlign: 'center' }}>
    <div id="photobar">
      <a id="prev" rel="prev" aria-label="Предыдущая фотография" aria-disabled={!photo.previousId}
        href={photo.previousId ? '/photo/' + photo.previousId + '/' + scope : undefined}><span>&lt;</span></a>
      <a id="next" rel="next" aria-label="Следующая фотография" aria-disabled={!photo.nextId}
        href={photo.nextId ? '/photo/' + photo.nextId + '/' + scope : undefined}><span>&gt;</span></a>
      <div style={{ display: 'inline-block' }}>
        <div id="underphoto_frame"><div id="ph_frame">
          {video ? <video controls><source src={video} /></video> : <a href={image}>
            <img id="ph" src={image} alt="" title="Фотография" loading="lazy" />
          </a>}
          {photo.contestEntry && <a className="underphoto" href="/voting">
            <img style={{ marginTop: -4 }} src="/static/img/star_people.png" alt="" loading="lazy" />
            {'  Фотография участвует в голосовании'}
          </a>}
          {photo.contestPlaces.map((place, index) => <a key={index} className="underphoto"
            style={{ fontWeight: 'bold' }} href="/voting/results">
            <img style={{ marginTop: -4 }} src={'/static/img/vs' + (4 - place) + '.png'} alt="" loading="lazy" />
            {'  '}{place}-е место на фотоконкурсе
          </a>)}
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
