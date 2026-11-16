/**
 * The rolling-stock database: entity kinds (Трамвай) → models shared by every city (71-931 «Витязь») → concrete
 * vehicles of a model in a city (Санкт-Петербург, № 5000). GeoDB is a tree of countries, regions, cities and depots.
 */

/**
 * Vehicle states, with the row colour class the lists use: `s1` … `s9` as on transphoto (s2 green «не был», s3 yellow,
 * s4 grey, s5 pink «списан», s6 brown, s7 light blue «КВР», s9 lilac «передан»), `s1x` on odd rows.
 */
export const vehicleStatuses = [
  { id: 1, label: 'Эксплуатируется', css: 1 },
  { id: 0, label: 'Не был в эксплуатации', css: 2 },
  { id: 2, label: 'Не эксплуатируется', css: 3 },
  { id: 3, label: 'Выведен из эксплуатации / ожидает списания', css: 4 },
  { id: 4, label: 'Списан', css: 5 },
  { id: 5, label: 'Местонахождение и судьба неизвестны', css: 6 },
  { id: 6, label: 'КВР / модернизация (смена модели)', css: 7 },
  { id: 8, label: 'Сохранён (музей, памятник)', css: 8 },
  { id: 7, label: 'Передан в другой город', css: 9 },
] as const;

/** States that count as «действующий» in the per-city totals. */
export const activeStatuses: readonly number[] = [1, 2];

export function vehicleStatus(id: number) {
  return vehicleStatuses.find(status => status.id === id) ?? vehicleStatuses[0];
}

/** The `s…` class of a list row; `odd` rows get the darker shade. */
export function statusClass(id: number, odd = false) {
  const css = vehicleStatus(id).css;
  return 's' + (odd ? 10 + css : css);
}

export const vehiclePurposes = [
  { id: 0, label: 'Пассажирский', filter: 'пассажирские' },
  { id: 1, label: 'Служебный', filter: 'служебные' },
  { id: 2, label: 'Музейный', filter: 'музейные' },
  { id: 3, label: 'Учебный', filter: 'учебные' },
] as const;

export function vehiclePurpose(id: number) {
  return vehiclePurposes.find(purpose => purpose.id === id) ?? vehiclePurposes[0];
}

export const geoKinds = [
  { id: 1, label: 'Страна', plural: 'Страны' },
  { id: 2, label: 'Регион', plural: 'Регионы' },
  { id: 3, label: 'Город', plural: 'Города' },
  { id: 4, label: 'Депо / парк', plural: 'Депо и парки' },
  { id: 5, label: 'Место', plural: 'Места' },
] as const;

export const GeoKind = { Country: 1, Region: 2, City: 3, Depot: 4, Place: 5 } as const;

/** Which kinds may contain which (null: top level). */
export function geoParentKinds(kind: number): number[] {
  switch (kind) {
    case GeoKind.Country: return [];
    case GeoKind.Region: return [GeoKind.Country];
    case GeoKind.City: return [GeoKind.Country, GeoKind.Region];
    case GeoKind.Depot: return [GeoKind.City];
    default: return [GeoKind.Country, GeoKind.Region, GeoKind.City];
  }
}

export interface GeoNode {
  id: number;
  title: string;
  parent_id: number | null;
  kind: number;
  code: string | null;
  sort: number;
}

/**
 * Partial dates are stored as `YYYY`, `YYYY-MM` or `YYYY-MM-DD` and typed and shown the Russian way: `2024`,
 * `10.2024`, `25.10.2024`.
 */
export function formatPartialDate(value: string | null | undefined) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return [day, month, year].filter(Boolean).join('.');
}

/** The stored form of a typed partial date, `''` for an empty one and `null` when it is not a date. */
export function parsePartialDate(input: string): string | null {
  const text = input.trim();
  if (!text) return '';
  const match = text.match(/^(?:(\d{1,2})\.)?(?:(\d{1,2})\.)?(\d{4})$/);
  if (!match) return null;
  const [, first, second, year] = match;
  const [day, month] = second !== undefined ? [first, second] : [undefined, first];
  if (Number(year) < 1800 || Number(year) > 2100) return null;
  if (month === undefined) return year;
  if (Number(month) < 1 || Number(month) > 12) return null;
  const mm = month.padStart(2, '0');
  if (day === undefined) return year + '-' + mm;
  const dd = Number(day);
  if (dd < 1 || dd > new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()) return null;
  return year + '-' + mm + '-' + day.padStart(2, '0');
}

/** Types of custom fields: the legacy string and number, plus partial dates and multi-line text. */
export const fieldTypes = [
  { id: '1', label: 'Строка' },
  { id: '2', label: 'Число' },
  { id: '3', label: 'Дата' },
  { id: '4', label: 'Текст' },
] as const;

/**
 * A custom field of an entity's template, added on top of the standard columns. `scope` says whether models or
 * vehicles fill it; vehicle fields with `list` also become a column of the rolling-stock list.
 */
export interface EntityFieldDef {
  /** Position in the template, the key values are stored under. */
  key: string;
  name: string;
  id: string;
  type: string;
  required: boolean;
  scope: 'model' | 'vehicle';
  list: boolean;
}

export interface GeoRef { id: number; title: string }

export interface ModelRef { id: number; title: string }

/** A city with the country it lies in, for headings like «Волгоград (Россия)». */
export interface CityRef extends GeoRef { country: GeoRef | null; code: string | null }

export interface VehicleSummary {
  id: number;
  number: string;
  factoryNumber: string;
  vin: string;
  built: string;
  started: string;
  retired: string;
  scrapped: string;
  status: number;
  purpose: number;
  note: string;
  city: CityRef | null;
  depot: GeoRef | null;
  model: ModelRef | null;
  photos: number;
  /** Values of the list's custom columns (`VehicleListData.columns`), in order. */
  extra: string[];
}

/** An entity kind as the site pages show it; `navColor` recolours the navbar (null keeps the default). */
export interface EntityRef { id: number; title: string; color: string; navColor: string | null }

export interface VehicleDetails extends VehicleSummary {
  entity: EntityRef;
  /** «Санкт-Петербург, Трамвай № 5000». */
  heading: string;
  fields: { label: string; value: string }[];
}

export interface ModelPageData {
  id: number;
  title: string;
  manufacturer: string;
  builtFrom: number | null;
  builtTo: number | null;
  description: string;
  entity: EntityRef;
  parent: ModelRef | null;
  children: (ModelRef & { vehicles: number })[];
  fields: { label: string; value: string }[];
  photos: { id: number; photourl: string }[];
  /** «Эксплуатация в городах»: countries with their cities, totals and active vehicles. */
  countries: { country: GeoRef | null; total: number; active: number; cities: { city: GeoRef | null; total: number; active: number }[] }[];
  total: number;
  active: number;
  withSubmodels: boolean;
}

export const listSorts = [
  { id: 'zn', label: 'заводскому номеру' },
  { id: 'num', label: 'бортовому номеру' },
  { id: 'built', label: 'дате постройки' },
  { id: 'start', label: 'дате поступления' },
  { id: 'leave', label: 'дате выбытия (списания)' },
  { id: 'scrap', label: 'дате утилизации' },
] as const;

export type ListSort = typeof listSorts[number]['id'];

export const listPageSize = 500;

export interface VehicleListData {
  /** The breadcrumb of what the list is filtered by, e.g. «Россия → 71-932-03 «Невский»». */
  title: string;
  model: (ModelRef & { entityId: number }) | null;
  country: GeoRef | null;
  city: GeoRef | null;
  depot: GeoRef | null;
  purpose: number | null;
  sort: ListSort;
  offset: number;
  total: number;
  /** Custom vehicle fields shown as extra columns (only when the list is narrowed to one model). */
  columns: string[];
  vehicles: VehicleSummary[];
}

/**
 * Angle a vehicle was shot from. 1–8 go round the vehicle clockwise as seen from above, starting at the front;
 * the rest are special views.
 */
export const vehicleAngles = [
  { id: 0, label: 'Не указан' },
  { id: 1, label: 'Спереди' },
  { id: 2, label: 'Спереди слева' },
  { id: 3, label: 'Слева' },
  { id: 4, label: 'Сзади слева' },
  { id: 5, label: 'Сзади' },
  { id: 6, label: 'Сзади справа' },
  { id: 7, label: 'Справа' },
  { id: 8, label: 'Спереди справа' },
  { id: 9, label: 'Вид сверху' },
  { id: 10, label: 'Вид снизу' },
  { id: 11, label: 'Салон' },
  { id: 12, label: 'Кабина' },
  { id: 13, label: 'Заводская табличка' },
  { id: 14, label: 'Отдельные элементы ТС' },
] as const;

export function vehicleAngle(id: number) {
  return vehicleAngles.find(angle => angle.id === id) ?? vehicleAngles[0];
}

/** A vehicle found by number on the upload page. */
export interface UploadVehicleMatch {
  id: number;
  number: string;
  entityId: number;
  model: ModelRef | null;
  city: CityRef | null;
  depot: GeoRef | null;
  built: string;
  retired: string;
  status: number;
  note: string;
}

/** One vehicle bound to an uploaded photo (the `vehicles` form value is a JSON array of these). */
export interface UploadVehicleLink {
  id: number;
  route: string;
  note: string;
  angle: number;
}

export const maxPhotoVehicles = 10;

/**
 * Kinds of dated events in a vehicle's life, shown between its photos on the vehicle page. `css` is the
 * status class of the bar; `wraps` marks the events after which the vehicle is gone from its city, so the
 * photos taken later are wrapped in the event's colour.
 */
export const vehicleEventKinds = [
  { id: 1, label: 'Поступил на предприятие', css: 's12', wraps: false },
  { id: 2, label: 'Начало эксплуатации', css: 's12', wraps: false },
  { id: 3, label: 'Смена госномера', css: 's31', wraps: false },
  { id: 4, label: 'Перенумерован', css: 's11', wraps: false },
  { id: 5, label: 'Передан в другое депо', css: 's11', wraps: false },
  { id: 6, label: 'Передан в другой город', css: 's19', wraps: true },
  { id: 7, label: 'КВР / модернизация', css: 's17', wraps: false },
  { id: 8, label: 'Капитальный ремонт', css: 's17', wraps: false },
  { id: 9, label: 'Отставлен от эксплуатации', css: 's13', wraps: false },
  { id: 10, label: 'Выведен из эксплуатации', css: 's14', wraps: false },
  { id: 11, label: 'Списан', css: 's15', wraps: true },
  { id: 12, label: 'Утилизирован', css: 's15', wraps: true },
  { id: 13, label: 'Сохранён (музей, памятник)', css: 's18', wraps: true },
  { id: 14, label: 'Другое', css: 's11', wraps: false },
] as const;

export const vehicleEventKind = (id: number) => vehicleEventKinds.find(kind => kind.id === id) ?? vehicleEventKinds[vehicleEventKinds.length - 1];

/** How sure the date of an event is. */
export const eventApprox = [
  { id: 0, label: 'Точно' },
  { id: 1, label: 'или позднее' },
  { id: 2, label: 'или ранее' },
  { id: 3, label: 'около' },
] as const;

export interface VehicleEvent {
  /** `null` for an event derived from the vehicle's own dates (Начало работы, Выбытие, Утилизация). */
  id: number | null;
  kind: number;
  /** Partial date: YYYY, YYYY-MM or YYYY-MM-DD. */
  date: string;
  approx: number;
  note: string;
}

const genitiveMonths = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const nominativeMonths = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

/** «22 декабря 1999 г. или позднее», «Май 2025 г.», «около 1978 г.». */
export function eventDateLabel(date: string, approx = 0) {
  const [year, month, day] = date.split('-');
  if (!year) return '';
  const text = day ? Number(day) + ' ' + genitiveMonths[Number(month) - 1] + ' ' + year + ' г.'
    : month ? nominativeMonths[Number(month) - 1] + ' ' + year + ' г.' : year + ' г.';
  if (approx === 3) return 'около ' + (month && !day ? genitiveMonths[Number(month) - 1] + ' ' + year + ' г.' : text);
  return approx === 1 ? text + ' или позднее' : approx === 2 ? text + ' или ранее' : text;
}
