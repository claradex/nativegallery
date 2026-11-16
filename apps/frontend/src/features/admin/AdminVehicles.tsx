import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { Button } from './ui/button';
import { VehicleForm, VehiclesTable, type VehicleDetails, type VehicleFilters, type VehicleOptions, type VehiclePage } from './vehicles/VehicleViews';

const back = { href: '/admin?type=Vehicles', label: 'Подвижной состав' };
const idParam = (value: string | null) => value && /^\d{1,10}$/.test(value) ? value : '';

export function AdminVehicles(query: URLSearchParams) {
  const filters: VehicleFilters = {
    entity: idParam(query.get('entity')), model: idParam(query.get('model')), city: idParam(query.get('city')),
    q: (query.get('q') ?? '').trim().slice(0, 64),
  };
  const page = idParam(query.get('page')) || '1';
  return AdminPage('editor', async () => {
    const search = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), page });
    const [data, options] = await Promise.all([
      adminData<VehiclePage>('/api/admin/vehicles?' + search),
      adminData<VehicleOptions>('/api/admin/vehicles/options'),
    ]);
    const preset = new URLSearchParams({ type: 'VehicleCreate', ...(filters.model ? { model: filters.model } : {}), ...(filters.city ? { city: filters.city } : {}) });
    const create = options.entities.length
      ? <Button asChild><Link href={'/admin?' + preset}><Plus />ТС</Link></Button>
      : <Button disabled title="Сначала создайте сущность"><Plus />ТС</Button>;
    return <>
      <PageHeader title="Подвижной состав" description="Конкретные экземпляры: бортовой номер, модель, город и депо. Фотографии привязываются к ним." actions={create} />
      <VehiclesTable data={data} options={options} filters={filters} create={create} />
    </>;
  });
}

export function AdminVehicleForm(id?: string | null, query?: URLSearchParams) {
  if (id !== undefined && !idParam(id ?? null)) notFound();
  return AdminPage('editor', async () => {
    const [options, vehicle] = await Promise.all([
      adminData<VehicleOptions>('/api/admin/vehicles/options'),
      id ? adminData<VehicleDetails>('/api/admin/vehicles/' + id) : Promise.resolve(undefined),
    ]);
    return <>
      <PageHeader title={vehicle ? 'ТС № ' + vehicle.title : 'Новое ТС'} back={back}
        description={vehicle ? 'Запись № ' + vehicle.id + '. Сущность изменить нельзя.' : 'Экземпляр модели в конкретном городе.'} />
      <VehicleForm options={options} vehicle={vehicle}
        preset={query ? { model: idParam(query.get('model')) || undefined, city: idParam(query.get('city')) || undefined } : undefined} />
    </>;
  });
}
