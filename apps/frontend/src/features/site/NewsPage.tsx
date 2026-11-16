import Link from '../../components/Link';
import { apiGet } from '../../api/client';
import { legacyDate } from '@nativegallery/contracts';

export function NewsItem({ body, time }: { body: string; time: number }) {
  return <div className="ix-news-item">
    <b>{legacyDate(time)}</b>
    <div className="break-links" style={{ paddingTop: 3 }} dangerouslySetInnerHTML={{ __html: body }} />
  </div>;
}

/** `/news` lists site news, `/news?kind=1` transport news. */
export async function NewsPage({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  const raw = (await searchParams).kind;
  const transport = (Array.isArray(raw) ? raw[0] : raw) === '1';
  const items = await apiGet<{ id: number; body: string; time: number }[]>('/api/internal/news?kind=' + (transport ? 1 : 0));
  return <tr><td className="main">
    <h1>{transport ? 'Новости транспорта' : 'Новости сайта'}</h1>
    <p className="ct-filters">{transport
      ? <><Link href="/news">Новости сайта</Link> · <b>Новости транспорта</b></>
      : <><b>Новости сайта</b> · <Link href="/news?kind=1">Новости транспорта</Link></>}</p>
    <div className="sm" style={{ marginBottom: 15, lineHeight: '13px', whiteSpace: 'normal' }}>
      {items.length ? items.map(item => <NewsItem key={item.id} body={item.body} time={item.time} />) : 'Новостей пока нет.'}
    </div>
  </td></tr>;
}
