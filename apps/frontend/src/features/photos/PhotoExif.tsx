import type { PhotoPageData } from '@nativegallery/contracts';

export function PhotoExif({ fields }: { fields: PhotoPageData['exif'] }) {
  if (!fields.length) return null;
  return <div id="pp-item-vdata">
    <div className="p0" id="pp-item-exif">
      <div className="header-container"><h4 className="pp-item-header">Параметры съёмки</h4></div>
      <div className="pp-item-body"><table className="linetable" id="exif"><tbody>
        {fields.map(({ label, value }) => <tr key={label} className="s11 h21">
          <td className="ds nw" style={{ width: '30%' }}>{label}:</td><td className="ds">{value}</td>
        </tr>)}
      </tbody></table></div>
    </div>
  </div>;
}
