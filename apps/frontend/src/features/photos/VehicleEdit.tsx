import { VehicleEditForm, type VehicleModel } from './VehicleEditForm';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function VehicleEdit() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/vehicle-models', {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load vehicle data');
  const models: VehicleModel[] = await response.json();
  return <VehicleEditForm models={models} />;
}
