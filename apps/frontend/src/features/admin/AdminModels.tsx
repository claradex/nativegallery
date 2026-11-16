import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader, SectionTabs } from './PageHeader';
import { ModelForm, ModelsTable, type ModelDetails, type ModelRow } from './models/ModelViews';
import type { VehicleOptions } from './vehicles/VehicleViews';
import { RequestsList, type VehicleRequest } from './models/RequestsList';
import { Button } from './ui/button';

const back = { href: '/admin?type=Models', label: 'Все модели' };

export function AdminModels(query: URLSearchParams) {
  return AdminPage('editor', async () => {
    const [models, { entities }] = await Promise.all([
      adminData<ModelRow[]>('/api/admin/models/catalog'),
      adminData<VehicleOptions>('/api/admin/vehicles/options'),
    ]);
    const entity = query.get('entity') ?? '';
    const create = entities.length
      ? <Button asChild><Link href={'/admin?type=ModelsCreate' + (/^\d+$/.test(entity) ? '&entity=' + entity : '')}><Plus />Модель</Link></Button>
      : <Button disabled title="Сначала создайте сущность"><Plus />Модель</Button>;
    return <>
      <PageHeader title="Модели" description="Общие карточки моделей для всех городов и стран. Конкретные экземпляры — в разделе «Подвижной состав»." actions={create} />
      <ModelsTable models={models} entities={entities} initialEntity={/^\d+$/.test(entity) ? entity : ''} create={create} />
    </>;
  });
}

export function AdminModelForm(id?: string | null, entity?: string | null) {
  if (id !== undefined && !/^\d{1,10}$/.test(id ?? '')) notFound();
  return AdminPage('editor', async () => {
    const [{ entities, models }, model] = await Promise.all([
      adminData<VehicleOptions>('/api/admin/vehicles/options'),
      id ? adminData<ModelDetails>('/api/admin/models/catalog/' + id) : Promise.resolve(undefined),
    ]);
    return <>
      <PageHeader title={model ? model.title : 'Новая модель'} back={back}
        description={model ? 'Модель № ' + model.id + ', ТС: ' + model.vehicles + '. Сущность изменить нельзя.' : 'Общая карточка модели: её видно на странице модели для всех городов.'} />
      <ModelForm entities={entities} models={models} model={model} initialEntity={entity && /^\d+$/.test(entity) ? entity : undefined} />
    </>;
  });
}

const requestTabs = [{ status: 0, label: 'Новые' }, { status: 1, label: 'Принятые' }, { status: 2, label: 'Отклонённые' }];

export function AdminVehicleRequests(query: URLSearchParams) {
  const status = query.get('status') === '1' ? 1 : query.get('status') === '2' ? 2 : 0;
  return AdminPage('editor', async () => {
    const [requests, pending] = await Promise.all([
      adminData<VehicleRequest[]>('/api/admin/models/requests?status=' + status),
      status ? adminData<VehicleRequest[]>('/api/admin/models/requests?status=0') : Promise.resolve(null),
    ]);
    return <>
      <PageHeader title="Заявки на ТС" description="Пользователи предлагают ТС, которых нет в базе. Принятая заявка сразу становится записью подвижного состава."
        actions={<Button variant="outline" asChild><Link href="/admin?type=Vehicles">Подвижной состав</Link></Button>} />
      <SectionTabs tabs={requestTabs.map(tab => ({
        href: '/admin?type=VehicleRequests' + (tab.status ? '&status=' + tab.status : ''), label: tab.label, active: tab.status === status,
        count: tab.status === 0 ? (pending ?? requests).length : undefined,
      }))} />
      {status > 0 && <p className="mb-4 text-[13px] text-muted-foreground">Показаны последние 100 заявок.</p>}
      <RequestsList requests={requests} status={status} />
    </>;
  });
}
