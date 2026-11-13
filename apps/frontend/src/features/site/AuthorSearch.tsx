
interface AuthorResult {
  id: number;
  username: string;
  photourl: string;
}

export async function AuthorSearch({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.trim() : '';
  let authors: AuthorResult[] = [];
  if (query) {
    const search = new URLSearchParams({ q: query });
    const response = await fetch(api + '/api/users/search?' + search, { cache: 'no-store' }).catch(() => null);
    if (!response?.ok) throw new Error('Could not load author search results');
    authors = await response.json();
  }
  return <tr><td className="main">
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
  </td></tr>;
}
