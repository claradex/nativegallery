import { apiGet } from '../../api/client';
import { legacyDate } from '@nativegallery/contracts';

export function NewsItem({ body, time }: { body: string; time: number }) {
  return <div className="ix-news-item">
    <b>{legacyDate(time)}</b>
    <div className="break-links" style={{ paddingTop: 3 }} dangerouslySetInnerHTML={{ __html: body }} />
  </div>;
}

export async function NewsPage() {
  const items = await apiGet<{ id: number; body: string; time: number }[]>('/api/internal/news');
  return <tr><td className="main">
    <h1>Новости сайта</h1>
    <div className="sm" style={{ marginBottom: 15, lineHeight: '13px', whiteSpace: 'normal' }}>
      {items.map(item => <NewsItem key={item.id} body={item.body} time={item.time} />)}
    </div>
  </td></tr>;
}
