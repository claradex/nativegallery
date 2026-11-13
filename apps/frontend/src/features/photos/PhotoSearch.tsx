import { redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';
import { legacyDate, type PhotoSearchResult } from '@nativegallery/contracts';

function SearchForm({ authorId }: { authorId?: string }) {
  return <form id="sf" method="get" action="/search">
    <label htmlFor="search-author">ID автора&nbsp;</label>
    <input id="search-author" name="id" inputMode="numeric" pattern="[0-9]{1,10}" defaultValue={authorId} required />
    {' '}<button type="submit">Найти</button>
  </form>;
}

function Results({ data }: { data: PhotoSearchResult }) {
  const pageHref = (page: number) => '/search?' + new URLSearchParams({ id: String(data.authorId), page: String(page) });
  return <>
    <div>Найдено изображений: <b>{data.total}</b> &nbsp;·&nbsp; <a href="#sf">Новый поиск</a></div><br />
    {data.photos.map(photo => <div className="p20p" key={photo.id}><table><tbody><tr>
      <td className="pb_photo"><a href={'/photo/' + photo.id + '/?aid=' + data.authorId} target="_blank" className="prw">
        <img className="f" src={photo.photourl} alt="" loading="lazy" />
        <div className="hpshade">
          {photo.comments > 0 && <div className="com-icon">{photo.comments}</div>}
          <div className="eye-icon">{photo.views}</div>
        </div>
      </a></td>
      <td className="pb_descr">
        <p><b className="pw-place">{photo.place}</b></p><span className="pw-descr">{photo.postbody}</span>
        <p className="sm"><b>{legacyDate(photo.timeupload)}</b><br />
          Автор: <a href={'/author/' + data.authorId + '/'}>{photo.author}</a></p>
      </td>
    </tr></tbody></table></div>)}
    {data.pages > 1 && <p>
      {data.page > 1 && <a href={pageHref(data.page - 1)}>← Предыдущая</a>}
      {' '}{data.page} / {data.pages}{' '}
      {data.page < data.pages && <a href={pageHref(data.page + 1)}>Следующая →</a>}
    </p>}
  </>;
}

export async function PhotoSearch({ searchParams }: {
  searchParams: Promise<{ id?: string | string[]; page?: string | string[] }>;
}) {
  const { viewer, cookie } = await siteContext();
  if (!viewer) redirect('/login');

  const query = await searchParams;
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const page = (Array.isArray(query.page) ? query.page[0] : query.page) ?? '1';
  let data: PhotoSearchResult | null = null;
  let invalid = false;
  if (id !== undefined) {
    const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
    const search = new URLSearchParams({ id, page });
    const response = await fetch(api + '/api/internal/photo-search?' + search, {
      cache: 'no-store', headers: { cookie: cookie ?? '' },
    }).catch(() => null);
    if (response?.status === 403) redirect('/login');
    if (response?.ok) data = await response.json();
    else if (response?.status === 400) invalid = true;
    else throw new Error('Could not load photo search results');
  }
  return <tr><td className="main">
    <h1>Результаты поиска</h1>
    {invalid && <p role="alert">Некорректные параметры поиска</p>}
    {data && <Results data={data} />}<SearchForm authorId={id} />
  </td></tr>;
}
