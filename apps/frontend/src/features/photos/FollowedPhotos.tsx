import { legacyDate, type TopPhoto } from '@nativegallery/contracts';
import { renderToStaticMarkup } from '../../components/RenderMarkup';

function FollowedPhoto({ photo }: { photo: TopPhoto }) {
  return <div className="p20p"><table><tbody><tr>
    <td className="pb_photo" id="p1941865"><a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
      <img className="f" src={photo.photourl} alt="620 КБ" />
      <div className="hpshade"><div className="eye-icon">{photo.views}</div></div>
    </a></td>
    <td className="pb_descr">
      <p><b className="pw-place">{photo.place}</b></p>
      <span className="pw-descr">{photo.postbody}</span>
      <p className="sm"><b>{legacyDate(photo.timeupload)}</b><br />Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a></p>
    </td>
  </tr></tbody></table></div>;
}

export async function FollowedPhotos(request: Request, api: string) {
  const response = await fetch(api + '/api/internal/followed-photos', {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });

  const photos: TopPhoto[] = await response.json();
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    renderToStaticMarkup(<tr><td className="main">
      <h1>Фотографии избранных авторов</h1>
      {photos.length > 0
        ? <div className="mark-btn"><a className="button" href="#">Отметить все фотографии просмотренными</a></div>
        : <div className="p20" style={{ marginBottom: 15 }} id="no_photos"><h4>Новых фотографий пока нет.</h4></div>}
      {photos.map(photo => <FollowedPhoto key={photo.id} photo={photo} />)}
    </td></tr>) +
    '__SCRIPT_FollowedPhotos__<tr>__FOOTER__</tr></table></body></html>';
}
