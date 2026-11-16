/**
 * Blocks of the home page, modelled on transphoto.org's front page. The admin panel («Главная страница») picks who sees
 * each block, its order inside its column and an optional heading; the «Произвольный блок» also carries its own HTML.
 */

/** Who sees a block: everyone, signed-in visitors only, or nobody (switched off). */
export const homeBlockVisibilities = [
  { id: 'all', label: 'Всем' },
  { id: 'users', label: 'Только вошедшим' },
  { id: 'none', label: 'Никому' },
] as const;
export type HomeBlockVisibility = typeof homeBlockVisibilities[number]['id'];

export const homeColumns = [
  { id: 'left', label: 'Левая колонка' },
  { id: 'center', label: 'Центр' },
  { id: 'right', label: 'Правая колонка' },
] as const;
export type HomeColumn = typeof homeColumns[number]['id'];

export const homeBlockDefinitions = [
  { key: 'contest', title: 'Фотоконкурс', column: 'left', description: 'Идущий фотоконкурс, а между конкурсами — фото-победитель последнего.' },
  { key: 'popular', title: 'Самые популярные за 24 часа', column: 'left', description: 'Фотографии с наибольшим числом просмотров за сутки.' },
  { key: 'discussed', title: 'Самые обсуждаемые за 24 часа', column: 'left', description: 'Фотографии с наибольшим числом новых комментариев за сутки. Вместе с популярными показывается вкладкой.' },
  { key: 'random', title: 'Случайные фотографии', column: 'center', description: 'Семь случайных опубликованных фотографий.' },
  { key: 'vehicleSearch', title: 'Поиск подвижного состава', column: 'center', description: 'Виды транспорта со ссылками на списки моделей и числом ТС в базе.' },
  { key: 'recent', title: 'Недавно добавленные фотографии', column: 'center', description: 'Лента последних опубликованных фотографий.' },
  { key: 'transportNews', title: 'Новости электротранспорта', column: 'center', description: 'Новости с типом «Транспорт» из раздела «Новости», с городом.' },
  { key: 'discussions', title: 'Последние обсуждения', column: 'center', description: 'Свежие комментарии к фотографиям.' },
  { key: 'daily', title: 'Фотографии, добавленные за последние 24 часа', column: 'center', description: 'Сводка новых фотографий по городам и видам транспорта.' },
  { key: 'online', title: 'Сейчас на сайте', column: 'center', description: 'Пользователи, заходившие за последние 5 минут.' },
  { key: 'custom', title: 'Произвольный блок', column: 'right', description: 'Свой HTML: баннеры, ссылки на сообщества и издания.' },
  { key: 'siteNews', title: 'Новости сайта', column: 'right', description: 'Новости с типом «Сайт» из раздела «Новости».' },
] as const satisfies readonly { key: string; title: string; column: HomeColumn; description: string }[];

export type HomeBlockKey = typeof homeBlockDefinitions[number]['key'];
export const homeBlockKeys = homeBlockDefinitions.map(block => block.key) as HomeBlockKey[];

/** A block's stored settings merged over its definition. `title` is the heading actually shown. */
export interface HomeBlockSettings {
  key: HomeBlockKey;
  column: HomeColumn;
  visibility: HomeBlockVisibility;
  sort: number;
  /** Heading override; empty keeps the default title. */
  customTitle: string;
  title: string;
  defaultTitle: string;
  description: string;
  /** HTML of the «Произвольный блок»; empty for the others. */
  body: string;
}

/** Off by default: an empty custom block. Everything else is shown to everyone. */
export const defaultVisibility = (key: HomeBlockKey): HomeBlockVisibility => key === 'custom' ? 'none' : 'all';

export const isHomeBlockVisibility = (value: unknown): value is HomeBlockVisibility =>
  homeBlockVisibilities.some(item => item.id === value);

/** Kinds of news: site announcements and transport news (`news.kind`). */
export const newsKinds = [
  { id: 0, label: 'Сайт' },
  { id: 1, label: 'Транспорт' },
] as const;
export const NewsKind = { Site: 0, Transport: 1 } as const;

export interface HomeNewsItem { id: number; body: string; time: number; city: string | null; cityId: number | null }

/** A ranked photo: views over the last 24 hours and comments in total, both shown on the tile. */
export interface HomePhoto { id: number; photourl: string; priority: number; views: number; comments: number }

export interface HomeData {
  blocks: { key: HomeBlockKey; column: HomeColumn; title: string; body: string }[];
  popular: HomePhoto[];
  discussed: HomePhoto[];
  random: { id: number; photourl: string; place: string; posted_at: number }[];
  online: { id: number; username: string }[];
  siteNews: HomeNewsItem[];
  transportNews: HomeNewsItem[];
  recent: { id: number }[];
  contest: { status: number; theme: string; closedate: number; closepretendsdate: number } | null;
  /** The latest contest winner, shown while no contest runs. */
  contestWinner: { photoId: number; photourl: string; place: number; theme: string } | null;
  vehicleTypes: { id: number; title: string; models: number; vehicles: number }[];
  discussions: { id: number; photoId: number; photourl: string; place: string; body: string; postedAt: number; authorId: number; author: string }[];
  daily: { place: string; items: { title: string; count: number; href: string }[] }[];
}
