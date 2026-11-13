import { renderToStaticMarkup } from 'react-dom/server';

interface AuthorResult {
  id: number;
  username: string;
  photourl: string;
}

export async function AuthorSearch(request: Request, api: string) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  let authors: AuthorResult[] = [];
  if (query) {
    const search = new URLSearchParams({ q: query });
    const response = await fetch(api + '/api/users/search?' + search, { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
    authors = await response.json();
  }
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Поиск авторов</h1>
    <form method="get" action="/authors.php" className="p20">
      <label htmlFor="author-query">Имя автора&nbsp;</label>
      <input type="search" id="author-query" name="q" maxLength={255} defaultValue={query} required />
      {' '}<button type="submit">Найти</button>
    </form>
    {query && (authors.length ? <ul className="straight">
      {authors.map(author => <li key={author.id}>
        <a href={'/author/' + author.id + '/'}>
          <img src={author.photourl || '/static/img/avatar.png'} width={32} alt="" loading="lazy" data-avatar-fallback />{' '}
          {author.username}
        </a>
      </li>)}
    </ul> : <p>Авторы не найдены.</p>)}
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
