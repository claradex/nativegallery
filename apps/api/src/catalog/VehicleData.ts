import { database, Prisma } from '@nativegallery/database';
import { formatPartialDate, vehiclePurpose, vehicleStatus, type PhotoVehicleData, type VehicleDetails, type VehicleEvent } from '@nativegallery/contracts';
import { entityFields, fieldValues, vehicleColumns, vehicleHeading, vehicleSummaries, type VehicleRow } from './VehicleCatalog';

export async function vehicleDetails(id: number): Promise<VehicleDetails | null> {
  if (id < 1) return null;
  const [row] = await database.$queryRaw<(VehicleRow & { content: string | null })[]>(Prisma.sql`
    SELECT ${vehicleColumns}, v.content FROM entities_data v WHERE v.id = ${id}
  `);
  if (!row) return null;
  const [[summary], entity] = await Promise.all([
    vehicleSummaries([row]),
    database.entity.findUnique({ where: { id: row.entityid }, select: { id: true, title: true, color: true, navcolor: true, sampledata: true } }),
  ]);
  return {
    ...summary,
    entity: { id: row.entityid, title: entity?.title ?? '', color: entity?.color ?? '', navColor: entity?.navcolor ?? null },
    heading: vehicleHeading(summary.city?.title, entity?.title ?? '', summary.number),
    fields: fieldValues(row.content, entityFields(entity?.sampledata), 'vehicle'),
  };
}

/** The vehicle block of a photo page: the main facts as plain label/value rows. */
export async function findVehicle(id: number): Promise<Omit<PhotoVehicleData, 'route' | 'note' | 'angle'> | null> {
  const vehicle = await vehicleDetails(id);
  if (!vehicle) return null;
  const rows: [string, string][] = [
    ['Город', vehicle.city ? vehicle.city.title + (vehicle.city.country ? ' (' + vehicle.city.country.title + ')' : '') : ''],
    ['Депо/Парк', vehicle.depot?.title ?? ''],
    ['Модель', vehicle.model?.title ?? ''],
    ['Построен', formatPartialDate(vehicle.built)],
    ['Заводской №', vehicle.factoryNumber],
    ['Текущее состояние', vehicleStatus(vehicle.status).label],
    ['Назначение', vehiclePurpose(vehicle.purpose).label],
  ];
  return {
    id, title: vehicle.heading, heading: vehicle.heading, status: vehicle.status, model: vehicle.model,
    fields: [...rows.filter(([, value]) => value).map(([label, value]) => ({ label, value })), ...vehicle.fields],
  };
}

/**
 * Events of a vehicle for its timeline: the ones entered by editors, plus «Поступил на предприятие»,
 * «Выведен из эксплуатации» / «Списан» and «Утилизирован» derived from its dates unless an editor entered them.
 */
export async function vehicleEvents(vehicle: Pick<VehicleDetails, 'id' | 'started' | 'retired' | 'scrapped' | 'status'>): Promise<VehicleEvent[]> {
  const rows = await database.vehicleEvent.findMany({ where: { entitydata_id: vehicle.id }, orderBy: [{ date: 'desc' }, { id: 'desc' }] });
  const events: VehicleEvent[] = rows.map(row => ({ id: row.id, kind: row.kind, date: row.date, approx: row.approx, note: row.note ?? '' }));
  const has = (...kinds: number[]) => events.some(event => kinds.includes(event.kind));
  const derive = (date: string, kind: number, ...covered: number[]) => {
    if (date && !has(kind, ...covered)) events.push({ id: null, kind, date, approx: 0, note: '' });
  };
  derive(vehicle.started, 1, 2);
  derive(vehicle.retired, vehicle.status === 4 ? 11 : 10, 10, 11);
  derive(vehicle.scrapped, 12);
  return events;
}
