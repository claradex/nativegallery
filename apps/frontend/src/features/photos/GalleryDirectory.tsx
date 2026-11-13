import { renderToStaticMarkup } from 'react-dom/server';

interface GallerySummary {
  id: number;
  title: string;
}

export async function GalleryDirectory(api: string) {
  const response = await fetch(api + '/api/internal/galleries', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const galleries: GallerySummary[] = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Разные фотогалереи</h1>
    <div className="p20">
      <ul className="straight">
        {galleries.map(gallery => <li key={gallery.id}><a href={'/article/' + gallery.id}>{gallery.title}</a></li>)}
      </ul>
    </div>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
