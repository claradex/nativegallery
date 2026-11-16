import type { ReactNode } from 'react';
import { eventDateLabel, siteDay, vehicleEventKind, type VehicleEvent, type VehiclePageData } from '@nativegallery/contracts';

type Photo = VehiclePageData['photos'][number];
type Entry = { photo: Photo; key: string } | { event: VehicleEvent; key: string };

/** The bar of one event: «↑ 22 декабря 1999 г. или позднее   Поступил на предприятие». */
function EventMark({ event, closing }: { event: VehicleEvent; closing?: boolean }) {
  const kind = vehicleEventKind(event.kind);
  return <div className={closing ? 'ct-event-mark' : 'ct-event ' + kind.css}>
    ↑&nbsp;&nbsp; <b>{eventDateLabel(event.date, event.approx)}</b>&nbsp;&nbsp;&nbsp; {kind.label}{event.note && <> — {event.note}</>}
  </div>;
}

/**
 * Photos newest first with the vehicle's events between them, the way transphoto shows a vehicle: an event goes
 * below every photo taken on or after its date, years are split by a dotted line, and the photos after an event
 * that takes the vehicle away (Списан, Передан в другой город …) are wrapped in that event's colour.
 */
export function VehicleTimeline({ photos, events, renderPhoto }: {
  photos: Photo[]; events: VehicleEvent[]; renderPhoto: (photo: Photo) => ReactNode;
}) {
  const dated: Entry[] = [], undated: Photo[] = [];
  for (const photo of photos) {
    const key = siteDay(photo.takenAt);
    if (key) dated.push({ photo, key }); else undated.push(photo);
  }
  for (const event of events) dated.push({ event, key: event.date });
  // Newest first; on the same date the photos stay above the event, since «↑» says they were taken after it.
  dated.sort((a, b) => a.key < b.key ? 1 : a.key > b.key ? -1 : ('photo' in a ? 0 : 1) - ('photo' in b ? 0 : 1));

  const out: ReactNode[] = [];
  let group: ReactNode[] = [];
  let year = '';
  dated.forEach((entry, index) => {
    const entryYear = entry.key.slice(0, 4);
    if (year && entryYear !== year) group.push(<div key={'y' + index} className="ct-year">
      <div className="ct-year-newer">{year}</div><div className="ct-year-older">{entryYear}</div>
    </div>);
    year = entryYear;
    if ('photo' in entry) { group.push(<div key={'p' + entry.photo.id}>{renderPhoto(entry.photo)}</div>); return; }
    const kind = vehicleEventKind(entry.event.kind);
    const key = 'e' + (entry.event.id ?? 'auto' + index);
    if (kind.wraps && group.some(node => (node as { key?: string }).key?.startsWith('p'))) {
      out.push(<div key={key} className={'ct-event-block ' + kind.css}><br />{group}<EventMark event={entry.event} closing /></div>);
    } else {
      out.push(...group, <EventMark key={key} event={entry.event} />);
    }
    group = [];
  });
  out.push(...group);
  if (undated.length) {
    if (dated.length) out.push(<div key="undated" className="ct-year"><div className="ct-year-older">Дата не указана</div></div>);
    out.push(...undated.map(photo => <div key={'p' + photo.id}>{renderPhoto(photo)}</div>));
  }
  return <>{out}</>;
}
