import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate, type GalleryData } from '@nativegallery/contracts';
import { NotFound } from '../site/StaticPages';

function GalleryPhoto({ photo }: { photo: GalleryData['photos'][number] }) {
  const thumbnail = photo.photourl.startsWith('/uploads/')
    ? '/api/photo/compress?url=' + encodeURIComponent(photo.photourl) : photo.photourl;
  return <>
    <div className="p20p" style={{ padding: '0 5px' }}><table><tbody><tr>
      <td className="pb_photo" id="p2017137"><a href={'/photo/' + photo.id} target="_blank" className="prw">
        <img className="f" src={thumbnail} alt="598 КБ" />
        <div className="hpshade"><div className="eye-icon">{photo.views}</div></div>
      </a></td>
      <td className="pb_descr">
        <p>{photo.postbody}</p>
        <p><b className="pw-place">{photo.place}</b></p>
        <p className="sm"><b>{legacyDate(photo.postedAt)}</b><br />Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a></p>
      </td>
    </tr></tbody></table></div><br />
  </>;
}

export async function GalleryPage(request: Request, api: string, id: string) {
  const response = await fetch(api + '/api/internal/galleries/' + id, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 404) return NotFound(request);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const data: GalleryData = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>{data.title}</h1>
    {data.photos.map(photo => <GalleryPhoto key={photo.id} photo={photo} />)}
    <div id="scroll_anchor"></div>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
