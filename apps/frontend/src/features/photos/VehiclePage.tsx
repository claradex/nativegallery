import type { ReactNode } from 'react';
import Link from '../../components/Link';
import { NavbarTheme } from '../../components/NavbarTheme';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';
import { formatPartialDate, shootingDate, vehiclePurpose, type VehiclePageData } from '@nativegallery/contracts';
import { canEditCatalog, CityLink, Paragraphs, StatusLabel } from './CatalogParts';
import { VehicleTimeline } from './VehicleTimeline';

function VehiclePhoto({ photo, vehicleId }: { photo: VehiclePageData['photos'][number]; vehicleId: number }) {
  return <div className="p20p s11"><table><tbody><tr>
    <td className="pb_photo"><a href={'/photo/' + photo.id + '/?vid=' + vehicleId} target="_blank" className="prw">
      <img className="f" src={'/api/photo/compress?url=' + encodeURIComponent(photo.photourl)} alt="" loading="lazy" />
      <div className="hpshade">
        {photo.comments > 0 && <div className="com-icon">{photo.comments}</div>}
        <div className="eye-icon">{photo.views}</div>
      </div>
    </a></td>
    <td className="pb_descr">
      <p><b className="pw-place">{photo.place}</b></p>
      <p className="sm">{shootingDate(photo.takenAt) || 'Дата не указана'}{photo.route && <><br />Маршрут {photo.route}</>}</p>
      <span className="pw-descr">{photo.postbody}</span>
      <p className="sm">Автор: <Link href={'/author/' + photo.authorId + '/'}>{photo.author}</Link>
      </p>
    </td>
  </tr></tbody></table></div>;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return <tr className="h21"><td className="ds nw">{label}:</td><td className="d">{children}</td></tr>;
}

/** The «Списки подвижного состава» links, from the narrowest list to the whole model. */
function Lists({ vehicle }: { vehicle: VehiclePageData['vehicle'] }) {
  const { model, city, depot } = vehicle;
  const links: [string, string][] = [];
  if (depot && model) links.push(['/list?did=' + depot.id + '&mid=' + model.id, [city?.title, depot.title, model.title].filter(Boolean).join(' → ')]);
  if (depot) links.push(['/list?did=' + depot.id, [city?.title, depot.title].filter(Boolean).join(' → ')]);
  if (city && model) links.push(['/list?cid=' + city.id + '&mid=' + model.id, city.title + ' → ' + model.title]);
  if (city) links.push(['/list?cid=' + city.id, city.title]);
  if (city?.country && model) links.push(['/list?rid=' + city.country.id + '&mid=' + model.id, city.country.title + ' → ' + model.title]);
  if (model) links.push(['/list?mid=' + model.id, model.title]);
  if (!links.length) return null;
  return <div className="p20 ct-links">
    <h4>Списки подвижного состава:</h4>
    {links.map(([href, label]) => <div key={href}><Link href={href}>{label}</Link></div>)}
  </div>;
}

function VehicleContent({ vehicle, photos, events, editable }: VehiclePageData & { editable: boolean }) {
  const date = (value: string) => formatPartialDate(value) || null;
  return <tr><td className="main">
    <NavbarTheme color={vehicle.entity.navColor} />
    <h1>{vehicle.heading}</h1>
    <table className="horlines ct-facts">
      <colgroup><col style={{ width: 170 }} /><col /></colgroup>
      <tbody>
        <Fact label="Город"><b><CityLink city={vehicle.city} /></b></Fact>
        {vehicle.depot && <Fact label="Депо/Парк"><b><Link href={'/list?did=' + vehicle.depot.id}>{vehicle.depot.title}</Link></b></Fact>}
        <Fact label="Модель">{vehicle.model
          ? <b><Link href={'/model/' + vehicle.model.id}>{vehicle.model.title}</Link></b>
          : <span className="ct-muted">не указана</span>}</Fact>
        <Fact label="Вид">{vehicle.entity.title}</Fact>
        {date(vehicle.built) && <Fact label="Построен"><b>{date(vehicle.built)}</b></Fact>}
        {vehicle.factoryNumber && <Fact label="Заводской №"><b>{vehicle.factoryNumber}</b></Fact>}
        {vehicle.vin && <Fact label="VIN / № шасси"><b>{vehicle.vin}</b></Fact>}
        <Fact label="Текущее состояние"><StatusLabel status={vehicle.status} /></Fact>
        <Fact label="Назначение">{vehiclePurpose(vehicle.purpose).label}</Fact>
        {date(vehicle.started) && <Fact label="Начало работы"><b>{date(vehicle.started)}</b></Fact>}
        {date(vehicle.retired) && <Fact label="Выбытие"><b>{date(vehicle.retired)}</b></Fact>}
        {date(vehicle.scrapped) && <Fact label="Утилизация"><b>{date(vehicle.scrapped)}</b></Fact>}
        {vehicle.fields.map(({ label, value }, index) => <Fact key={index} label={label}><b><Paragraphs text={value} /></b></Fact>)}
        {vehicle.note && <Fact label="Примечание"><Paragraphs text={vehicle.note} /></Fact>}
      </tbody>
    </table>
    {editable && <p className="sm"><Link href={'/admin?type=VehicleEdit&id=' + vehicle.id}>Редактировать в панели управления</Link></p>}
    {!photos.length && <div className="p20">Фотографий этого ТС пока нет.</div>}
    <div className="ct-timeline">
      <VehicleTimeline photos={photos} events={events} renderPhoto={photo => <VehiclePhoto photo={photo} vehicleId={vehicle.id} />} />
    </div>
    <br />
    <Lists vehicle={vehicle} />
  </td></tr>;
}

export async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const [data, editable] = await Promise.all([
    apiGet<VehiclePageData>('/api/internal/vehicle/' + id, { missing: true, error: 'Could not load vehicle data' }),
    canEditCatalog(),
  ]);
  return <VehicleContent {...data} editable={editable} />;
}
