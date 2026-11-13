import { renderToStaticMarkup } from 'react-dom/server';
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

export async function PhotoSearch(request: Request, api: string) {
  const query = new URL(request.url).searchParams;
  const id = query.get('id') ?? undefined;
  let data: PhotoSearchResult | null = null;
  const headers = { cookie: request.headers.get('cookie') ?? '' };
  if (id !== undefined) {
    const search = new URLSearchParams({ id, page: query.get('page') ?? '1' });
    const response = await fetch(api + '/api/internal/photo-search?' + search, { cache: 'no-store', headers }).catch(() => null);
    if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
    if (response?.status === 400) return new Response('Некорректные параметры поиска', { status: 400 });
    if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
    data = await response.json();
  } else {
    const response = await fetch(api + '/api/internal/viewer', { cache: 'no-store', headers }).catch(() => null);
    if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
    if (!(await response.json()).viewer) return Response.redirect(new URL('/login', request.url), 302);
  }
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Результаты поиска</h1>{data && <Results data={data} />}<SearchForm authorId={id} />
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">' +
    '__NAVBAR__' + content + '<tr>__FOOTER__</tr></table></body></html>';
}
