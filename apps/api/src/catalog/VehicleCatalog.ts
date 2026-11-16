import { database, Prisma } from '@nativegallery/database';
import { GeoKind, formatPartialDate, parsePartialDate, type CityRef, type EntityFieldDef, type GeoRef, type VehicleSummary } from '@nativegallery/contracts';

type Json = Record<string, unknown>;

function record(source: string | null | undefined): Json {
  if (!source) return {};
  try {
    const value: unknown = JSON.parse(source);
    if (value && typeof value === 'object') return value as Json;
  } catch {}
  return {};
}

const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';

/** The custom fields of an entity's template, in order. Fields saved before scopes existed belong to vehicles. */
export function entityFields(sampledata: string | null | undefined): EntityFieldDef[] {
  return Object.entries(record(sampledata)).map(([key, raw]) => {
    const field = (raw && typeof raw === 'object' ? raw : {}) as Json;
    return {
      key, name: text(field.name), id: text(field.id), type: text(field.type) || '1',
      required: field.important === '1' || field.important === 1,
      scope: field.scope === 'model' ? 'model' as const : 'vehicle' as const,
      list: field.scope !== 'model' && (field.list === '1' || field.list === 1 || field.list === true),
    };
  });
}

/** One custom value as shown: dates the Russian way, everything else as typed. */
export function fieldValue(content: Json, field: EntityFieldDef) {
  const value = text((content[field.key] as Json | undefined)?.value).trim();
  return field.type === '3' && /^\d{4}(-\d\d){0,2}$/.test(value) ? formatPartialDate(value) : value;
}

export const contentRecord = record;

/** Labelled values of a model's or vehicle's `content`, skipping empty ones. */
export function fieldValues(content: string | null | undefined, fields: EntityFieldDef[], scope: EntityFieldDef['scope']) {
  const values = record(content);
  return fields.filter(field => field.scope === scope && field.name).flatMap(field => {
    const value = fieldValue(values, field);
    return value ? [{ label: field.name, value }] : [];
  });
}

/** `content` JSON for one scope from `modelinput_<key>` form values; throws through `invalid` on a bad value. */
export function contentFromBody(body: Json, fields: EntityFieldDef[], scope: EntityFieldDef['scope'], invalid: () => never) {
  const values: Json = {};
  for (const field of fields) {
    if (field.scope !== scope) continue;
    const value = body['modelinput_' + field.key] ?? '';
    if (typeof value !== 'string' || value.length > (field.type === '4' ? 10000 : 1000) || (field.required && !value.trim())) invalid();
    let stored = field.type === '4' ? value.replace(/\r\n/g, '\n').trim() : value.trim();
    if (field.type === '2' && stored && !/^-?\d+(?:[.,]\d+)?$/.test(stored)) invalid();
    if (field.type === '3') {
      const date = parsePartialDate(stored);
      if (date === null) invalid();
      stored = date;
    }
    values[field.key] = { value: stored };
  }
  const content = JSON.stringify(values);
  if (Buffer.byteLength(content) > 65535) invalid();
  return content;
}

type GeoRow = { id: number; title: string; parent_id: number | null; kind: number; code: string | null };

/** GeoDB entries with all their ancestors, so cities can be shown with their country. */
export async function geoTree(ids: Iterable<number | null | undefined>) {
  const nodes = new Map<number, GeoRow>();
  let wanted = [...new Set([...ids].filter((id): id is number => !!id))];
  for (let depth = 0; wanted.length && depth < 6; depth++) {
    const rows = await database.geoEntry.findMany({
      where: { id: { in: wanted } }, select: { id: true, title: true, parent_id: true, kind: true, code: true },
    });
    for (const row of rows) nodes.set(row.id, row);
    wanted = [...new Set(rows.map(row => row.parent_id).filter((id): id is number => !!id && !nodes.has(id)))];
  }
  const ancestor = (id: number | null | undefined, kind: number) => {
    for (let node = id ? nodes.get(id) : undefined, step = 0; node && step < 6; node = node.parent_id ? nodes.get(node.parent_id) : undefined, step++) {
      if (node.kind === kind) return node;
    }
    return undefined;
  };
  const ref = (node?: GeoRow): GeoRef | null => node ? { id: node.id, title: node.title } : null;
  return {
    ref: (id: number | null | undefined) => ref(id ? nodes.get(id) : undefined),
    country: (id: number | null | undefined) => ref(ancestor(id, GeoKind.Country)),
    city: (id: number | null | undefined): CityRef | null => {
      const node = id ? nodes.get(id) : undefined;
      if (!node) return null;
      const country = ancestor(id, GeoKind.Country);
      return { id: node.id, title: node.title, code: country?.code ?? null, country: ref(country) };
    },
  };
}

/** A GeoDB entry and everything under it (a country's regions, cities and depots). */
export async function geoDescendants(id: number) {
  const all = new Set([id]);
  let level = [id];
  for (let depth = 0; level.length && depth < 6; depth++) {
    level = (await database.geoEntry.findMany({ where: { parent_id: { in: level } }, select: { id: true } }))
      .map(row => row.id).filter(child => !all.has(child));
    level.forEach(child => all.add(child));
  }
  return [...all];
}

/** «Санкт-Петербург, Трамвай № 5000»; without a city just «Трамвай № 5000». */
export function vehicleHeading(city: string | null | undefined, entity: string, number: string) {
  return (city ? city + ', ' : '') + (entity || 'ТС') + (number ? ' № ' + number : '');
}

export const vehicleColumns = Prisma.sql`v.id, v.title, v.comment, v.entityid, v.model_id, v.city_id, v.depot_id,
  v.factory_number, v.vin, v.built, v.started, v.retired, v.scrapped, v.status, v.purpose,
  (SELECT COUNT(*) FROM photos p WHERE p.moderated = 1
    AND (p.entitydata_id = v.id OR p.id IN (SELECT photo_id FROM photos_vehicles pv WHERE pv.entitydata_id = v.id))) AS photos`;

export type VehicleRow = {
  id: number; title: string; comment: string | null; entityid: number; model_id: number | null; city_id: number | null;
  depot_id: number | null; factory_number: string | null; vin: string | null; built: string | null; started: string | null;
  retired: string | null; scrapped: string | null; status: number; purpose: number; photos: bigint | number;
};

/**
 * Turns `entities_data` rows selected with `vehicleColumns` into list entries with their model, city and depot;
 * `columns` are custom fields whose values go into `extra` (the rows must then also carry `content`).
 */
export async function vehicleSummaries(rows: (VehicleRow & { content?: string | null })[], columns: EntityFieldDef[] = []): Promise<VehicleSummary[]> {
  const modelIds = [...new Set(rows.map(row => row.model_id).filter((id): id is number => !!id))];
  const [models, geo] = await Promise.all([
    modelIds.length ? database.entityModel.findMany({ where: { id: { in: modelIds } }, select: { id: true, title: true } }) : [],
    geoTree(rows.flatMap(row => [row.city_id, row.depot_id])),
  ]);
  const byId = new Map(models.map(model => [model.id, model]));
  return rows.map(row => ({
    id: row.id, number: row.title, factoryNumber: row.factory_number ?? '', vin: row.vin ?? '',
    built: row.built ?? '', started: row.started ?? '', retired: row.retired ?? '', scrapped: row.scrapped ?? '',
    status: Number(row.status), purpose: Number(row.purpose), note: row.comment ?? '',
    city: geo.city(row.city_id), depot: geo.ref(row.depot_id),
    model: row.model_id ? byId.get(row.model_id) ?? null : null, photos: Number(row.photos),
    extra: columns.length ? columns.map(field => fieldValue(record(row.content), field)) : [],
  }));
}

/** Production years of a model: «2014–2023», «с 2014», «до 1990» or ''. */
export function modelYears(from: number | null, to: number | null) {
  if (from && to) return from === to ? String(from) : from + '–' + to;
  if (from) return 'с ' + from;
  if (to) return 'до ' + to;
  return '';
}
