import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';
import { legacyDate, type VehiclePageData } from '@nativegallery/contracts';

function VehiclePhoto({ photo, vehicleId }: { photo: VehiclePageData['photos'][number]; vehicleId: number }) {
  return <div className="p20p s11"><table><tbody><tr>
    <td className="pb_photo"><a href={'/photo/' + photo.id + '/?vid=' + vehicleId} target="_blank" className="prw">
      <img className="f" src={'/api/photo/compress?url=' + encodeURIComponent(photo.photourl)} alt="678 КБ" loading="lazy" />
      <div className="hpshade">
        {photo.comments > 0 && <div className="com-icon">{photo.comments}</div>}
        <div className="eye-icon">{photo.views}</div>
      </div>
    </a></td>
    <td className="pb_descr">
      <p><b className="pw-place">{photo.place}</b></p>
      <span className="pw-descr">{photo.postbody}</span>
      <p className="sm"><b>{legacyDate(photo.timeupload)}</b><br />
        Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a>
      </p>
    </td>
  </tr></tbody></table></div>;
}

function VehicleContent({ vehicle, photos }: VehiclePageData) {
  return <tr><td className="main">
    <h1>{vehicle.title}</h1>
    <table className="horlines">
      <colgroup><col style={{ width: 150 }} /><col /></colgroup>
      <tbody>{vehicle.fields.map(({ label, value }, index) => <tr key={index} className="h21">
        <td className="ds nw">{label}:</td><td className="d"><b>{value}</b></td>
      </tr>)}</tbody>
    </table><br />
    {photos.map(photo => <VehiclePhoto key={photo.id} photo={photo} vehicleId={vehicle.id} />)}
  </td></tr>;
}

export async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const data = await apiGet<VehiclePageData>('/api/internal/vehicle/' + id, {
    auth: true, login: true, missing: true, error: 'Could not load vehicle data',
  });
  return <VehicleContent {...data} />;
}
