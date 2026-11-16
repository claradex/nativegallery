import Link from '../../components/Link';
import { vehicleAngle, type PhotoVehicleData } from '@nativegallery/contracts';

function VehicleLink({ vehicle }: { vehicle: PhotoVehicleData }) {
  return <Link href={'/vehicle/' + vehicle.id + '/'}>{vehicle.title}</Link>;
}

/** «Санкт-Петербург, трамвай 5000 — маршрут 3, примечание» lines above the description, one per vehicle. */
export function PhotoVehicleRoute({ vehicle }: { vehicle: PhotoVehicleData }) {
  const details = [vehicle.route && <>маршрут <b>{vehicle.route}</b></>, vehicle.note].filter(Boolean);
  return <tr>
    <td className="nw" style={{ verticalAlign: 'top', textAlign: 'right' }}><VehicleLink vehicle={vehicle} /></td>
    <td style={{ verticalAlign: 'top', textAlign: 'left' }}>{details.length > 0 && <>&nbsp;— &nbsp;{details.map((part, index) => <span key={index}>{index > 0 && ', '}{part}</span>)}</>}</td>
  </tr>;
}

export function PhotoVehicle({ vehicle }: { vehicle: PhotoVehicleData }) {
  return <div className="pp-item-vdata">
    <div className="p0">
      <h4 className="pp-item-header"><b><VehicleLink vehicle={vehicle} /></b></h4>
      <div className="pp-item-body">
        <table className="linetable">
          <colgroup><col style={{ width: '25%' }} /></colgroup>
          <tbody>
            {vehicle.fields.map(({ label, value }, index) => <tr key={index} className="s11 h21">
              <td className="ds nw">{label}:</td><td className="ds"><b>{value}</b></td>
            </tr>)}
            {vehicle.angle > 0 && <tr className="s11 h21"><td className="ds nw">Ракурс:</td><td className="ds">{vehicleAngle(vehicle.angle).label}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}
