import { legacyDate, type TopPhoto } from '@nativegallery/contracts';

function RankedPhoto({ photo, rank }: { photo: TopPhoto; rank: number }) {
  return (
    <div className="p20p">
      <table><tbody><tr>
        <td style={{ textAlign: 'center', padding: 10 }}>
          <b style={{ fontSize: 25 }}>{rank}</b><br /><br />
          <small>Новых просмотров:</small><br /><b>+{photo.views}</b><br /><br />
        </td>
        <td className="pb_photo" id="p1977446">
          <a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
            <img className="f" src={photo.photourl} alt="347 КБ" loading="lazy" />
          </a>
        </td>
        <td className="pb_descr">
          <p><b className="pw-place">{photo.place}</b></p>
          <span className="pw-descr">{photo.postbody}</span>
          <p className="sm">
            <b>{legacyDate(photo.timeupload)}</b><br />
            Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a>
          </p>
        </td>
      </tr></tbody></table>
    </div>
  );
}

function TopPhotosContent({ photos }: { photos: TopPhoto[] }) {
  return (
    <tr><td className="main">
      <div style={{ textAlign: 'center' }}>
        <h1>30 самых просматриваемых фото за 24 часа</h1>
        <div style={{ width: '80%', marginInline: 'auto' }}>
          {photos.map((photo, index) => <RankedPhoto key={photo.id} photo={photo} rank={index + 1} />)}
        </div>
      </div>
    </td></tr>
  );
}

export async function TopPhotos() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/top30', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load popular photos');
  const photos: TopPhoto[] = await response.json();
  return <TopPhotosContent photos={photos} />;
}
