import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate } from '@nativegallery/contracts';

export function NewsItem({ body, time }: { body: string; time: number }) {
  return <div className="ix-news-item">
    <b>{legacyDate(time)}</b>
    <div className="break-links" style={{ paddingTop: 3 }} dangerouslySetInnerHTML={{ __html: body }} />
  </div>;
}

export async function NewsPage(api: string) {
  const response = await fetch(api + '/api/internal/news', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const items: { id: number; body: string; time: number }[] = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Новости сайта</h1>
    <div className="sm" style={{ marginBottom: 15, lineHeight: '13px', whiteSpace: 'normal' }}>
      {items.map(item => <NewsItem key={item.id} body={item.body} time={item.time} />)}
    </div>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
