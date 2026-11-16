import Link from '../../components/Link';
import { notFound } from 'next/navigation';
import { apiGet } from '../../api/client';
import { formatPartialDate, listPageSize, listSorts, statusClass, vehiclePurposes, vehicleStatus, type VehicleListData } from '@nativegallery/contracts';
import { StatusLegend } from './CatalogParts';

type Query = Record<string, string | string[] | undefined>;

const keys = ['mid', 'rid', 'cid', 'did', 'serv', 'sort', 'st', 'sub'] as const;

function params(query: Query) {
  const search = new URLSearchParams();
  for (const key of keys) {
    const value = Array.isArray(query[key]) ? query[key][0] : query[key];
    if (typeof value === 'string' && /^[a-z0-9]{1,10}$/.test(value)) search.set(key, value);
  }
  return search;
}

/** The current address with some parameters changed (`null` drops one); paging restarts unless `st` is given. */
function withParams(base: URLSearchParams, change: Record<string, string | null>) {
  const next = new URLSearchParams(base);
  if (!('st' in change)) next.delete('st');
  for (const [key, value] of Object.entries(change)) value === null ? next.delete(key) : next.set(key, value);
  return '/list?' + next;
}

function Filters({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  const option = (active: boolean, href: string, label: string) => active ? <b key={label}>{label}</b> : <Link key={label} href={href}>{label}</Link>;
  return <>
    <div className="ct-filters">Назначение:{' '}
      {option(data.purpose === null, withParams(base, { serv: null }), 'любое')}
      {vehiclePurposes.map(purpose => option(data.purpose === purpose.id, withParams(base, { serv: String(purpose.id) }), purpose.filter))}
    </div>
    <div className="ct-filters">Сортировать по:{' '}
      {listSorts.map(sort => option(data.sort === sort.id, withParams(base, { sort: sort.id === 'zn' ? null : sort.id }), sort.label))}
    </div>
  </>;
}

function Pages({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  const pages = Math.ceil(data.total / listPageSize);
  if (pages < 2) return null;
  const current = Math.floor(data.offset / listPageSize);
  return <div className="ct-filters">{Array.from({ length: pages }, (_, page) => page === current
    ? <span key={page} className="pg">{page + 1}</span>
    : <Link key={page} className="pg" href={withParams(base, { st: page ? String(page * listPageSize) : null })}>{page + 1}</Link>)}</div>;
}

function ListContent({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  // Columns that would repeat the filter (the city when listing one city) are dropped.
  const showCity = !data.city && !data.depot;
  const showDepot = !data.depot;
  const showModel = !data.model;
  return <tr><td className="main">
    <h1>Список подвижного состава</h1>
    {data.model ? <h2><Link href={'/model/' + data.model.id}>{data.model.title}</Link></h2> : <h2>{data.title}</h2>}
    {data.model && data.title !== data.model.title && <p><b>{data.title}</b></p>}
    {data.model && <p><Link href={'/models?t=' + data.model.entityId}>К списку моделей</Link></p>}
    <Filters data={data} base={base} />
    <Pages data={data} base={base} />
    {data.vehicles.length ? <div className="ct-scroll"><table className="ct-list"><tbody>
      <tr>
        <th>№</th><th>Зав.№</th><th>Постр.</th><th>Нач.раб.</th><th>Отставл.</th>
        {showModel && <th>Модель</th>}{showCity && <th>Город</th>}{showDepot && <th>Депо/Парк</th>}
        {data.columns.map(column => <th key={column}>{column}</th>)}
        <th>Состояние</th><th>Примечание</th>
      </tr>
      {data.vehicles.map((vehicle, index) => <tr key={vehicle.id} className={statusClass(vehicle.status, index % 2 === 1)} id={'n' + vehicle.id}>
        <td className="n"><Link href={'/vehicle/' + vehicle.id + '/'}>{vehicle.number}</Link>{vehicle.photos > 0 && <span className="ml-count">{vehicle.photos}</span>}</td>
        <td className="ds">{vehicle.factoryNumber}</td>
        <td className="ds nw">{formatPartialDate(vehicle.built)}</td>
        <td className="ds nw">{formatPartialDate(vehicle.started)}</td>
        <td className="ds nw">{formatPartialDate(vehicle.retired)}</td>
        {showModel && <td className="ds">{vehicle.model ? <Link href={'/model/' + vehicle.model.id}>{vehicle.model.title}</Link> : '—'}</td>}
        {showCity && <td className="ds">{vehicle.city ? <Link href={'/list?cid=' + vehicle.city.id + (data.model ? '&mid=' + data.model.id : '')}>{vehicle.city.title}</Link> : '—'}</td>}
        {showDepot && <td className="ds">{vehicle.depot ? <Link href={'/list?did=' + vehicle.depot.id}>{vehicle.depot.title}</Link> : '—'}</td>}
        {vehicle.extra.map((value, column) => <td key={column} className="ds">{value}</td>)}
        <td className="ds">{vehicleStatus(vehicle.status).label}</td>
        <td className="ds ct-note">{vehicle.note}</td>
      </tr>)}
    </tbody></table></div> : <div className="p20">По этим условиям ТС не найдено.</div>}
    <p className="sm">Всего: {data.total}</p>
    <Pages data={data} base={base} />
    <StatusLegend />
  </td></tr>;
}

/** `/list` (and the legacy `/list.php`): rolling stock across all cities, by model, country, city or depot. */
export async function VehicleList({ searchParams }: { searchParams: Promise<Query> }) {
  const base = params(await searchParams);
  if (!['mid', 'rid', 'cid', 'did'].some(key => base.has(key))) notFound();
  const data = await apiGet<VehicleListData>('/api/internal/list?' + base, { missing: true, error: 'Could not load the list' });
  return <ListContent data={data} base={base} />;
}
