import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AdminConfig } from '../../features/admin/AdminConfig';
import { AdminContests } from '../../features/admin/AdminContests';
import { AdminEntities } from '../../features/admin/AdminEntities';
import { AdminGalleries } from '../../features/admin/AdminGalleries';
import { AdminGeo } from '../../features/admin/AdminGeo';
import { AdminVehicleForm, AdminVehicles } from '../../features/admin/AdminVehicles';
import { AdminModelForm, AdminModels, AdminVehicleRequests } from '../../features/admin/AdminModels';
import { AdminNews } from '../../features/admin/AdminNews';
import { AdminHomeBlocks } from '../../features/admin/AdminHomeBlocks';
import { AdminPages } from '../../features/admin/AdminPages';
import { AdminPhotos } from '../../features/admin/AdminPhotos';
import { AdminSettings } from '../../features/admin/AdminSettings';
import { AdminStorage } from '../../features/admin/AdminStorage';
import { AdminUsers } from '../../features/admin/AdminUsers';
import { siteContext } from '../../features/site/SiteContext';
import { setting } from '@nativegallery/config';

async function origin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const scheme = requestHeaders.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return setting('SITE_ORIGIN') || (host ? scheme + '://' + host : '');
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const titles: Record<string, string> = {
  General: 'Пользователи', UserEdit: 'Пользователь', Photo: 'Фотографии', VehicleRequests: 'Заявки на ТС',
  News: 'Новости', HomeBlocks: 'Главная страница', Pages: 'Страницы', PageCreate: 'Новая страница', PageEdit: 'Редактирование страницы',
  Galleries: 'Галереи', Contests: 'Фотоконкурсы', Entities: 'Сущности', EntityCreate: 'Новая сущность',
  EntityUpdate: 'Сущность', Models: 'Модели', ModelsCreate: 'Новая модель', ModelEdit: 'Редактирование модели',
  Vehicles: 'Подвижной состав', VehicleCreate: 'Новое ТС', VehicleEdit: 'Редактирование ТС', EntityEdit: 'Редактирование ТС', GeoDB: 'GeoDB', Config: 'Конфигурация', Storage: 'Хранилища', Settings: 'Фоновые задачи',
};

/** Set through metadata rather than a rendered <title>, so client-side navigation between sections updates it. */
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const type = (await searchParams).type;
  const section = titles[(Array.isArray(type) ? type[0] : type) || 'General'];
  return { title: section ? section + ' — Панель управления' : 'Панель управления' };
}

/** Sections keep the legacy `/admin?type=…` addresses, so old links and bookmarks still work. */
export default async function Admin({ searchParams }: { searchParams: SearchParams }) {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(await searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(name, first);
  }
  const id = query.get('id');
  switch (query.get('type')) {
    case null: case '': case 'General': {
      // The users list is the owner's home page; everyone else starts at the moderation queue.
      const { viewer } = await siteContext();
      if (viewer?.admin && viewer.admin !== 1) redirect('/admin?type=Photo');
      return AdminUsers(await origin());
    }
    case 'UserEdit': return AdminUsers(await origin(), query.get('user_id') ?? '');
    case 'Photo': return AdminPhotos(query);
    case 'VehicleRequests': return AdminVehicleRequests(query);
    case 'News': return AdminNews();
    case 'HomeBlocks': return AdminHomeBlocks();
    case 'Pages': return AdminPages('list');
    case 'PageCreate': return AdminPages('create');
    case 'PageEdit': return AdminPages('edit', id);
    case 'Galleries': return AdminGalleries();
    case 'Contests': return AdminContests(query);
    case 'Entities': return AdminEntities('list');
    case 'EntityCreate': return AdminEntities('create');
    case 'EntityUpdate': return AdminEntities('edit', id);
    case 'Models':
      if (query.get('tab') === 'moderate') redirect('/admin?type=VehicleRequests');
      return AdminModels(query);
    case 'ModelsCreate': return AdminModelForm(undefined, query.get('entity'));
    case 'ModelEdit': return AdminModelForm(id);
    case 'Vehicles': return AdminVehicles(query);
    case 'VehicleCreate': return AdminVehicleForm(undefined, query);
    case 'EntityEdit': case 'VehicleEdit': return AdminVehicleForm(id);
    case 'GeoDB': return AdminGeo();
    case 'Config': return AdminConfig();
    case 'Storage': return AdminStorage(query);
    case 'Settings': return AdminSettings();
  }
  notFound();
}
