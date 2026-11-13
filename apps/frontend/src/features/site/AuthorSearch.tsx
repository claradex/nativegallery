import { apiGet } from '../../api/client';

interface AuthorResult {
  id: number;
  username: string;
  photourl: string;
}

export async function AuthorSearch({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.trim() : '';
  const authors = query ? await apiGet<AuthorResult[]>('/api/users/search?' + new URLSearchParams({ q: query }), {
    error: 'Could not load author search results',
  }) : [];
  return <tr><td className="main">
    <h1>Поиск авторов</h1>
    <form method="get" action="/authors" className="p20">
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
