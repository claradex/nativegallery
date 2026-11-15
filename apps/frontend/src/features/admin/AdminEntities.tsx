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
      <PageHeader title="Новая сущность" back={back} description="Тип подвижного состава и набор полей для его моделей." />
      <EntityForm />
    </>;
    if (mode === 'edit') {
      const entity = await adminData<EntityDetails>('/api/admin/entities/' + id);
      return <>
        <PageHeader title={entity.title} back={back} description={'Моделей с этой сущностью: ' + entity.models + '.'} />
        <EntityForm entity={entity} />
      </>;
    }
    const entities = await adminData<EntityRow[]>('/api/admin/entities');
    const create = <Button asChild><Link href="/admin?type=EntityCreate"><Plus />Сущность</Link></Button>;
    return <>
      <PageHeader title="Сущности" description="Типы подвижного состава и поля, которые заполняются для их моделей." actions={create} />
      <EntitiesTable entities={entities} create={create} />
    </>;
  });
}
