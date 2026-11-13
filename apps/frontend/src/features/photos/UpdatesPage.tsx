import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate, type GalleryData } from '@nativegallery/contracts';

type UpdatePhoto = GalleryData['photos'][number] & { comments: number };

function UpdateCard({ photo }: { photo: UpdatePhoto }) {
  return <div className="p20p"><table><tbody><tr>
    <td className="pb_photo" id="p1936120">
      <a href={'/photo/' + photo.id} target="_blank" className="prw"><img className="f" src={photo.photourl} />
        <div className="hpshade">
          {photo.comments > 0 && <div className="com-icon">{photo.comments}</div>}
          <div className="eye-icon">{photo.views}</div>
        </div>
      </a>
    </td>
    <td className="pb_descr">
      <p><b className="pw-place">{photo.place}</b></p>
      <span className="pw-descr">{photo.postbody}</span>
      <p className="sm"><b>{legacyDate(photo.uploadedAt)}</b><br />Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a></p>
    </td>
  </tr></tbody></table></div>;
}

export async function UpdatesPage(api: string) {
  const response = await fetch(api + '/api/internal/updates', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const photos: UpdatePhoto[] = await response.json();
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Новые фотографии за 72 часа</h1>
    {photos.map(photo => <UpdateCard key={photo.id} photo={photo} />)}
    <br />
  </td></tr>);
  return '<html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
