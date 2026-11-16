import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from '../../components/Link';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { EntitiesTable, EntityForm, type EntityDetails, type EntityRow } from './entities/EntityViews';
import { Button } from './ui/button';

const back = { href: '/admin?type=Entities', label: 'Все сущности' };

export function AdminEntities(mode: 'list' | 'create' | 'edit', id?: string | null) {
  if (mode === 'edit' && !/^\d{1,10}$/.test(id ?? '')) notFound();
  return AdminPage('editor', async () => {
    if (mode === 'create') return <>
      <PageHeader title="Новая сущность" back={back} description="Вид подвижного состава и свои поля для его моделей и ТС." />
      <EntityForm />
    </>;
    if (mode === 'edit') {
      const entity = await adminData<EntityDetails>('/api/admin/entities/' + id);
      return <>
        <PageHeader title={entity.title} back={back} description={'Моделей: ' + entity.models + ', ТС: ' + entity.vehicles + '.'} />
        <EntityForm entity={entity} />
      </>;
    }
    const entities = await adminData<EntityRow[]>('/api/admin/entities');
    const create = <Button asChild><Link href="/admin?type=EntityCreate"><Plus />Сущность</Link></Button>;
    return <>
      <PageHeader title="Сущности" description="Виды подвижного состава (трамвай, троллейбус…) и шаблоны их дополнительных полей." actions={create} />
      <EntitiesTable entities={entities} create={create} />
    </>;
  });
}
