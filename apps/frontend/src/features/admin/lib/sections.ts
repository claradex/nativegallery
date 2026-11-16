import type { AdminRole } from './roles';

/** Menu entries, keyed by the `type` query parameter the legacy admin used (the users list has none). */
export const menu = [
  { group: 'Модерация', items: [
    { key: 'Photo', label: 'Фотографии', icon: 'camera', role: 'moderator', badge: 'pendingPhotos' },
    { key: 'VehicleRequests', label: 'Заявки на ТС', icon: 'inbox', role: 'editor', badge: 'pendingRequests' },
  ] },
  { group: 'Контент', items: [
    { key: 'News', label: 'Новости сайта', icon: 'newspaper', role: 'editor' },
    { key: 'Pages', label: 'Страницы', icon: 'file', role: 'owner' },
    { key: 'Galleries', label: 'Галереи', icon: 'images', role: 'owner' },
    { key: 'Contests', label: 'Фотоконкурсы', icon: 'trophy', role: 'editor' },
  ] },
  { group: 'Каталог', items: [
    { key: 'Entities', label: 'Сущности', icon: 'boxes', role: 'editor' },
    { key: 'Models', label: 'Модели', icon: 'database', role: 'editor' },
    { key: 'Vehicles', label: 'Подвижной состав', icon: 'train', role: 'editor' },
    { key: 'GeoDB', label: 'GeoDB', icon: 'globe', role: 'editor' },
  ] },
  { group: 'Система', items: [
    { key: 'General', label: 'Пользователи', icon: 'users', role: 'owner' },
    { key: 'Config', label: 'Конфигурация', icon: 'sliders', role: 'owner' },
    { key: 'Settings', label: 'Фоновые задачи', icon: 'settings', role: 'editor' },
  ] },
] as const satisfies readonly { group: string; items: readonly { key: string; label: string; icon: string; role: AdminRole; badge?: string }[] }[];

export type MenuKey = typeof menu[number]['items'][number]['key'];

/** Which menu entry a page belongs to (editors and detail pages light up their list). */
export function menuKey(type: string | null, tab: string | null): MenuKey {
  switch (type) {
    case null: case '': case 'General': case 'UserEdit': return 'General';
    case 'PageCreate': case 'PageEdit': return 'Pages';
    case 'EntityCreate': case 'EntityUpdate': return 'Entities';
    case 'ModelsCreate': case 'ModelEdit': return 'Models';
    case 'VehicleCreate': case 'VehicleEdit': case 'EntityEdit': return 'Vehicles';
    case 'Models': return tab === 'moderate' ? 'VehicleRequests' : 'Models';
    default: return type as MenuKey;
  }
}

export function href(key: MenuKey) {
  return key === 'General' ? '/admin' : '/admin?type=' + key;
}
