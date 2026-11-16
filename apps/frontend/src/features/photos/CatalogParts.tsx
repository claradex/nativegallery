import Link from '../../components/Link';
import { statusClass, vehicleStatus, vehicleStatuses, type CityRef } from '@nativegallery/contracts';
import { siteContext } from '../site/SiteContext';
import './Catalog.css';

/** Whether the viewer may edit the database (editors and administrators, not photo moderators). */
export async function canEditCatalog() {
  const { viewer } = await siteContext();
  return !!viewer?.admin && viewer.admin !== 2;
}

export function StatusLabel({ status }: { status: number }) {
  return <span className={'ct-status ' + statusClass(status)}>{vehicleStatus(status).label}</span>;
}

export function CityLink({ city }: { city: CityRef | null }) {
  if (!city) return <span className="ct-muted">—</span>;
  return <><Link href={'/list?cid=' + city.id}>{city.title}</Link>
    {city.country && <span className="ct-muted"> ({city.country.title})</span>}</>;
}

export function StatusLegend() {
  return <div className="ct-legend">{vehicleStatuses.map(status =>
    <span key={status.id} className={statusClass(status.id)}>{status.label}</span>)}</div>;
}

/** Multi-line text with line breaks kept. */
export function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((part, index) => <p key={index} className="ct-text">{part}</p>)}</>;
}
