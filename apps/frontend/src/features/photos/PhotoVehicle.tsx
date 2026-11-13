import type { PhotoPageData } from '@nativegallery/contracts';

type Vehicle = NonNullable<PhotoPageData['vehicle']>;

function VehicleLink({ vehicle }: { vehicle: Vehicle }) {
  return <a href={'/vehicle/' + vehicle.id}>{vehicle.title}</a>;
}

export function PhotoVehicleRoute({ vehicle, route }: { vehicle: Vehicle; route: string }) {
  return <tr>
    <td className="nw" style={{ verticalAlign: 'top', textAlign: 'right' }}><VehicleLink vehicle={vehicle} /></td>
    <td className="nw" style={{ verticalAlign: 'top', textAlign: 'left' }}>&nbsp;— &nbsp;маршрут <b>{route}</b></td>
  </tr>;
}

export function PhotoVehicle({ vehicle }: { vehicle: Vehicle }) {
  return <div id="pp-item-vdata">
    <div className="p0">
      <h4 className="pp-item-header"><b><VehicleLink vehicle={vehicle} /></b></h4>
      <div className="pp-item-body">
        <table className="linetable">
          <colgroup><col style={{ width: '25%' }} /></colgroup>
          <tbody>{vehicle.fields.map(({ label, value }, index) => <tr key={index} className="s11 h21">
            <td className="ds nw">{label}:</td><td className="ds"><b>{value}</b></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}
