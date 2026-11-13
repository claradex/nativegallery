import { VehicleRequestForm, type VehicleRequestData } from './VehicleRequestForm';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function VehicleRequest({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const query = await searchParams;
  const id = typeof query.type === 'string' ? query.type : '';
  if (!/^\d{1,10}$/.test(id)) notFound();
  const search = new URLSearchParams();
  for (const key of ['num', 'gos']) {
    const value = query[key];
    if (typeof value === 'string' && value) search.set(key, value);
  }
  const response = await fetch(api + '/api/vehicles/requests/' + id + '?' + search, {
    cache: 'no-store', headers: { cookie: (await headers()).get('cookie') ?? '' },
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Could not load vehicle data');
  const data: VehicleRequestData = await response.json();
  return <VehicleRequestForm data={data} action={'/vehicle/dbedit?' + new URLSearchParams({ type: id, ...Object.fromEntries(search) })} />;
}
