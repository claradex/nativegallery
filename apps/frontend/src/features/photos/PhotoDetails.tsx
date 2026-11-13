import type { PhotoDetailsData } from '@nativegallery/contracts';

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function Details({ photo }: { photo: PhotoDetailsData }) {
  const rows = [
    ['Идентификатор изображения:', photo.id, 's1'],
    ['Автор:', photo.author, 's1'],
    ['Опубликовано:', dateFormat.format(photo.publishedAt * 1000).replace(', ', ' '), 's11'],
    ['Находится на сайте, дней:', Math.floor((Date.now() / 1000 - photo.publishedAt) / 86400), 's1'],
    ['Уникальных просмотров:', photo.views, 's11'],
    ['Комментариев:', photo.comments, 's1'],
  ];
  return (
    <>
      <h1>Информация об изображении</h1>
      <div style={{ display: 'inline-block' }}>
        <a href={'/photo/' + photo.id + '/'}>
          <img src={'/api/photo/compress?url=' + encodeURIComponent(photo.url)} width={250} alt="347 КБ" className="f" loading="lazy" />
        </a>
      </div>
      <br /><br />
      <table className="p20"><tbody>
        {rows.map(([label, value, style]) => (
          <tr key={label} className={style + ' h21'}><td className="ds">{label}</td><td className="ds"><b>{value}</b></td></tr>
        ))}
      </tbody></table>
      <br />
      <h4>Динамика просмотров по датам</h4>
      <div className="p20w" style={{ padding: 5 }}>
        <img width={500} src={'/api/photo/stats?id=' + photo.id} alt="" loading="lazy" />
      </div>
      <br />
    </>
  );
}

function MissingPhoto() {
  return (
    <>
      <h1>Изображение не найдено</h1>
      <div className="p20w" style={{ marginBottom: 20, padding: '10px 30px' }}>
        <img src="/static/img/pnp.jpg" alt="Пусто" width={400} height={205} style={{ border: 0 }} loading="lazy" />
        <p>Изображения с таким номером нет на сайте.<br />Может быть, его здесь никогда и не было.<br />Если Вы уверены, что что-то здесь всё-таки было, значит, администратор по каким-то причинам это удалил.</p>
      </div>
    </>
  );
}

export async function PhotoDetails({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  let photo: PhotoDetailsData | null = null;
  if (typeof id === 'string' && /^\d+$/.test(id)) {
    const response = await fetch(api + '/api/internal/photo-details/' + id, { cache: 'no-store' }).catch(() => null);
    if (response?.ok) photo = await response.json();
    else if (response?.status !== 404) throw new Error('Could not load photo details');
  }

  return <tr><td className="main"><div style={{ textAlign: 'center' }}>
    {photo ? <Details photo={photo} /> : <MissingPhoto />}
  </div></td></tr>;
}
