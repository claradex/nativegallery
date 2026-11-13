import { legacyDate, type GalleryData } from '@nativegallery/contracts';

export function PublishedPhoto({ photo, feed = false }: { photo: GalleryData['photos'][number]; feed?: boolean }) {
  const thumbnail = photo.photourl.startsWith('/uploads/')
    ? '/api/photo/compress?url=' + encodeURIComponent(photo.photourl) : photo.photourl;
  return <>
    <div className={feed ? 'p5h' : 'p20p'} style={{ padding: '0 5px' }}><table><tbody><tr>
      {feed && <td className="pb-pre">{legacyDate(photo.uploadedAt)}</td>}
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
