import { VehicleEditForm, type VehicleModel } from './VehicleEditForm';
import { apiGet } from '../../api/client';

export async function VehicleEdit() {
  const models = await apiGet<VehicleModel[]>('/api/internal/vehicle-models', {
    auth: true, login: true, error: 'Could not load vehicle data',
  });
  return <VehicleEditForm models={models} />;
}
