import { VehicleRequestForm, type VehicleRequestData } from './VehicleRequestForm';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';

export async function VehicleRequest({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const id = query.type;
  if (!isId(id)) notFound();
  const search = new URLSearchParams();
  for (const key of ['num', 'gos']) {
    const value = query[key];
    if (typeof value === 'string' && value) search.set(key, value);
  }
  const data = await apiGet<VehicleRequestData>('/api/vehicles/requests/' + id + '?' + search, {
    auth: true, login: true, missing: true, error: 'Could not load vehicle data',
  });
  const text = (value: unknown, pattern: RegExp) => typeof value === 'string' && pattern.test(value) ? value : '';
  return <VehicleRequestForm data={data} action={'/api/vehicles/requests/' + id}
    initial={{ number: text(query.num, /^.{1,64}$/), city_id: text(query.city, /^\d{1,10}$/) }} />;
}
