import { MarkFollowedPhotos } from './MarkFollowedPhotos';
import { legacyDate, type TopPhoto } from '@nativegallery/contracts';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

export async function FollowedPhotos() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/followed-photos', {
    headers: { cookie: (await headers()).get('cookie') ?? '' },
    cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load saved photos');

  const photos: TopPhoto[] = await response.json();
  return <tr><td className="main">
      <h1>Фотографии избранных авторов</h1>
      {photos.length > 0
        ? <MarkFollowedPhotos />
        : <div className="p20" style={{ marginBottom: 15 }} id="no_photos"><h4>Новых фотографий пока нет.</h4></div>}
      {photos.map(photo => <FollowedPhoto key={photo.id} photo={photo} />)}
    </td></tr>;
}
