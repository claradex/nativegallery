import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader, SectionTabs } from './PageHeader';
import { ModelForm, ModelsTable, type EntityOption, type ModelDetails, type ModelRow } from './models/ModelViews';
import { RequestsList, type VehicleRequest } from './models/RequestsList';
import { Button } from './ui/button';

const back = { href: '/admin?type=Models', label: 'База моделей' };

export function AdminModels(query: URLSearchParams) {
  return AdminPage('editor', async () => {
    const [models, entities] = await Promise.all([
      adminData<ModelRow[]>('/api/admin/models/catalog'),
      adminData<EntityOption[]>('/api/internal/vehicle-models'),
    ]);
    const create = entities.length
      ? <Button asChild><Link href="/admin?type=ModelsCreate"><Plus />Модель</Link></Button>
      : <Button disabled title="Сначала создайте сущность"><Plus />Модель</Button>;
    const entity = query.get('entity') ?? '';
    return <>
      <PageHeader title="База моделей" description="Модели подвижного состава, к которым авторы привязывают фотографии." actions={create} />
      <ModelsTable models={models} entities={entities} initialEntity={/^\d+$/.test(entity) ? entity : ''} create={create} />
    </>;
  });
}

export function AdminModelForm(id?: string | null) {
  if (id !== undefined && !/^\d{1,10}$/.test(id ?? '')) notFound();
  return AdminPage('editor', async () => {
    const [entities, model] = await Promise.all([
      adminData<EntityOption[]>('/api/internal/vehicle-models'),
      id ? adminData<ModelDetails>('/api/admin/models/catalog/' + id) : Promise.resolve(undefined),
    ]);
    return <>
      <PageHeader title={model ? model.title : 'Новая модель'} back={back}
        description={model ? 'Модель № ' + model.id + '. Сущность изменить нельзя.' : 'Заполните описание и характеристики по шаблону сущности.'} />
      <ModelForm entities={entities} model={model} />
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
      <PageHeader title="Заявки на модели" description="Пользователи предлагают модели, которых нет в базе. Принятая заявка сразу становится моделью."
        actions={<Button variant="outline" asChild><Link href="/admin?type=Models">База моделей</Link></Button>} />
      <SectionTabs tabs={requestTabs.map(tab => ({
        href: '/admin?type=VehicleRequests' + (tab.status ? '&status=' + tab.status : ''), label: tab.label, active: tab.status === status,
        count: tab.status === 0 ? (pending ?? requests).length : undefined,
      }))} />
      {status > 0 && <p className="mb-4 text-[13px] text-muted-foreground">Показаны последние 100 заявок.</p>}
      <RequestsList requests={requests} status={status} />
    </>;
  });
}
