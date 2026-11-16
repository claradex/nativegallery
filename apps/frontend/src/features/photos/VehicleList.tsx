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

/** A row of choices separated by « · », the current one in bold, in a white box as on transphoto. */
function Choices({ label, items }: { label: string; items: { label: string; href: string; active: boolean }[] }) {
  return <div className="p20w c ct-choices">{label}: &nbsp;{items.map((item, index) => <span key={item.label}>
    {index > 0 && <>&nbsp;·&nbsp; </>}
    {item.active ? <b className="nw">{item.label}</b> : <Link className="nw" href={item.href}>{item.label}</Link>}
  </span>)}</div>;
}

function Filters({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  return <>
    <Choices label="Назначение" items={[
      { label: 'любое', href: withParams(base, { serv: null }), active: data.purpose === null },
      ...vehiclePurposes.map(purpose => ({ label: purpose.filter, href: withParams(base, { serv: String(purpose.id) }), active: data.purpose === purpose.id })),
    ]} /><br />
    <Choices label="Сортировать по" items={listSorts.map(sort => ({
      label: sort.label, href: withParams(base, { sort: sort.id === 'zn' ? null : sort.id }), active: data.sort === sort.id,
    }))} />
  </>;
}

/** «« 1 2 »» paging; the arrows are greyed out on the first and last page. */
function Pages({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  const pages = Math.ceil(data.total / listPageSize);
  if (pages < 2) return null;
  const current = Math.floor(data.offset / listPageSize);
  const href = (page: number) => withParams(base, { st: page ? String(page * listPageSize) : null });
  const arrow = (page: number, label: string) => page < 0 || page >= pages
    ? <span className="pg">{label}</span> : <Link className="pg" href={href(page)}>{label}</Link>;
  return <div className="pages">
    {arrow(current - 1, '««')}
    {Array.from({ length: pages }, (_, page) => page === current
      ? <span key={page} className="ps">{page + 1}</span>
      : <Link key={page} className="pg" href={href(page)}>{page + 1}</Link>)}
    {arrow(current + 1, '»»')}
  </div>;
}

function ListContent({ data, base }: { data: VehicleListData; base: URLSearchParams }) {
  // Columns that would repeat the filter (the city when listing one city) are dropped; the state is the row colour.
  const showCity = !data.city && !data.depot;
  const showDepot = !data.depot;
  const showModel = !data.model;
  return <tr><td className="main"><div className="ct-center">
    <h1>Список подвижного состава</h1>
    <h2 className="ct-subtitle">{data.model ? <Link href={'/model/' + data.model.id}>{data.model.title}</Link> : data.title}</h2>
    {data.model && data.title !== data.model.title && <div><b>{data.title}</b></div>}
    {data.model && <div><Link href={'/models?t=' + data.model.entityId}>К списку моделей</Link></div>}
    <br />
    <Filters data={data} base={base} />
    <br /><br />
    <Pages data={data} base={base} />
    {data.vehicles.length ? <div className="rtable"><div className="p20w"><table><tbody>
      <tr className="sticky">
        <th>№</th><th className="r">Зав.№</th><th className="r">Постр.</th><th className="r">Нач.раб.</th><th className="r">Отставл.</th>
        {showModel && <th className="c">Модель</th>}{showCity && <th className="c">Город</th>}{showDepot && <th className="c">Депо/Парк</th>}
        {data.columns.map(column => <th key={column} className="c">{column}</th>)}
        <th>Примечание</th>
      </tr>
      {data.vehicles.map((vehicle, index) => <tr key={vehicle.id} className={statusClass(vehicle.status, index % 2 === 1)} id={'n' + vehicle.id}
        title={vehicleStatus(vehicle.status).label}>
        <td className="n"><Link href={'/vehicle/' + vehicle.id + '/'} target="_blank">{vehicle.number}</Link></td>
        <td className="rm">{vehicle.factoryNumber}</td>
        <td className="rs nw">{formatPartialDate(vehicle.built)}</td>
        <td className="rs nw">{formatPartialDate(vehicle.started)}</td>
        <td className="rs nw">{formatPartialDate(vehicle.retired)}</td>
        {showModel && <td className="cs">{vehicle.model ? <Link href={'/model/' + vehicle.model.id}>{vehicle.model.title}</Link> : '-'}</td>}
        {showCity && <td className="cs">{vehicle.city ? <Link href={'/list?cid=' + vehicle.city.id + (data.model ? '&mid=' + data.model.id : '')}>{vehicle.city.title}</Link> : '-'}</td>}
        {showDepot && <td className="cs">{vehicle.depot ? <Link href={'/list?did=' + vehicle.depot.id}>{vehicle.depot.title}</Link> : '-'}</td>}
        {vehicle.extra.map((value, column) => <td key={column} className="cs">{value}</td>)}
        <td className="ds">{vehicle.note}</td>
      </tr>)}
    </tbody></table></div></div> : <div className="p20w c">По этим условиям ТС не найдено.</div>}
    <br />
    <div className="sm">Показано записей: {data.vehicles.length} из {data.total}</div>
    <br />
    <Pages data={data} base={base} />
    <StatusLegend />
  </div></td></tr>;
}

/** `/list` (and the legacy `/list.php`): rolling stock across all cities, by model, country, city or depot. */
export async function VehicleList({ searchParams }: { searchParams: Promise<Query> }) {
  const base = params(await searchParams);
  if (!['mid', 'rid', 'cid', 'did'].some(key => base.has(key))) notFound();
  const data = await apiGet<VehicleListData>('/api/internal/list?' + base, { missing: true, error: 'Could not load the list' });
  return <ListContent data={data} base={base} />;
}
