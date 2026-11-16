import { newsHtml } from '../news/NewsHtml';
import { Controller, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NewsKind, type HomeBlockKey, type HomeData, type HomeNewsItem, type SiteOverview, type TopPhoto } from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { blockVisible, homeBlocks } from './HomeBlocks';

const day = 86400;
const commentNotDeleted = Prisma.sql`COALESCE(JSON_UNQUOTE(JSON_EXTRACT(
  CASE WHEN JSON_VALID(c.content) THEN c.content ELSE '{}' END, '$.deleted')), '') <> 'true'`;
const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

/** Loads a block's data only when the block is shown, so switched-off blocks cost nothing. */
const when = <T,>(shown: boolean, load: () => Promise<T>, empty: T) => shown ? load() : Promise.resolve(empty);

async function news(kind: number, take: number): Promise<HomeNewsItem[]> {
  const rows = await database.news.findMany({
    where: { kind }, orderBy: [{ time: 'desc' }, { id: 'desc' }], take, select: { id: true, body: true, time: true, city_id: true },
  });
  const cityIds = [...new Set(rows.flatMap(row => row.city_id ? [row.city_id] : []))];
  const cities = new Map((cityIds.length
    ? await database.geoEntry.findMany({ where: { id: { in: cityIds } }, select: { id: true, title: true } }) : [])
    .map(city => [city.id, city.title]));
  return rows.map(row => ({ id: row.id, body: newsHtml(row.body), time: row.time, city: row.city_id ? cities.get(row.city_id) ?? null : null }));
}

/** Photos ranked by `table` rows (views or comments) since `since`. */
function ranked(source: Prisma.Sql) {
  return database.$queryRaw<{ id: number; photourl: string; priority: number; count: number }[]>(Prisma.sql`
    SELECT p.id, p.photourl, p.priority, CAST(r.n AS DOUBLE) AS count
    FROM (${source}) r JOIN photos p ON p.id = r.photo_id WHERE p.moderated = 1 ORDER BY r.n DESC, p.id DESC`);
}

/** Vehicle kinds with their model and vehicle counts, for «Поиск подвижного состава». */
async function vehicleTypes() {
  const [types, models, vehicles] = await Promise.all([
    database.entity.findMany({ select: { id: true, title: true }, orderBy: { id: 'asc' } }),
    database.entityModel.groupBy({ by: ['entityid'], _count: { _all: true } }),
    database.entityData.groupBy({ by: ['entityid'], _count: { _all: true } }),
  ]);
  return types.map(type => ({
    ...type,
    models: models.find(row => row.entityid === type.id)?._count._all ?? 0,
    vehicles: vehicles.find(row => row.entityid === type.id)?._count._all ?? 0,
  }));
}

async function discussions(): Promise<HomeData['discussions']> {
  const rows = await database.$queryRaw<{ id: number; photoId: number; photourl: string; place: string; body: string;
    postedAt: number; authorId: number; author: string }[]>(Prisma.sql`
    SELECT c.id, c.photo_id AS photoId, p.photourl, p.place, c.body, c.posted_at AS postedAt,
      c.user_id AS authorId, COALESCE(u.username, '') AS author
    FROM photos_comments c
    JOIN photos p ON p.id = c.photo_id AND p.moderated = 1
    LEFT JOIN users u ON u.id = c.user_id
    WHERE ${commentNotDeleted}
    ORDER BY c.id DESC LIMIT 8`);
  return rows.map(row => ({
    ...row, id: Number(row.id), photoId: Number(row.photoId), postedAt: Number(row.postedAt), authorId: Number(row.authorId),
    body: row.body.length > 300 ? row.body.slice(0, 300).trimEnd() + '…' : row.body,
  }));
}

/**
 * «Фотографии, добавленные за последние 24 часа»: new photos counted per city and vehicle kind (by the first vehicle on
 * the photo), gallery photos per gallery, the rest under «Прочее».
 */
async function daily(now: number): Promise<HomeData['daily']> {
  const photos = await database.photo.findMany({
    where: { moderated: 1, timeupload: { gte: now - day } }, orderBy: { id: 'desc' }, take: 5000,
    select: { id: true, gallery_id: true, entitydata_id: true },
  });
  if (!photos.length) return [];
  const links = await database.photoVehicle.findMany({
    where: { photo_id: { in: photos.map(photo => photo.id) } }, orderBy: [{ photo_id: 'asc' }, { position: 'asc' }],
    select: { photo_id: true, entitydata_id: true },
  });
  const firstVehicle = new Map<number, number>();
  for (const link of links) if (!firstVehicle.has(link.photo_id)) firstVehicle.set(link.photo_id, link.entitydata_id);
  const vehicleOf = (photo: typeof photos[number]) => firstVehicle.get(photo.id) ?? (photo.entitydata_id > 0 ? photo.entitydata_id : null);
  const vehicleIds = [...new Set(photos.flatMap(photo => vehicleOf(photo) ?? []))];
  const vehicles = new Map((vehicleIds.length ? await database.entityData.findMany({
    where: { id: { in: vehicleIds } }, select: { id: true, entityid: true, city_id: true },
  }) : []).map(vehicle => [vehicle.id, vehicle]));
  const cityIds = [...new Set([...vehicles.values()].flatMap(vehicle => vehicle.city_id ?? []))];
  const galleryIds = [...new Set(photos.flatMap(photo => photo.gallery_id > 0 ? [photo.gallery_id] : []))];
  const [cities, types, galleries] = await Promise.all([
    cityIds.length ? database.geoEntry.findMany({ where: { id: { in: cityIds } }, select: { id: true, title: true } }) : [],
    database.entity.findMany({ select: { id: true, title: true } }),
    galleryIds.length ? database.gallery.findMany({ where: { id: { in: galleryIds } }, select: { id: true, title: true } }) : [],
  ]);
  const cityTitle = new Map(cities.map(city => [city.id, city.title]));
  const typeTitle = new Map(types.map(type => [type.id, type.title]));
  const galleryTitle = new Map(galleries.map(gallery => [gallery.id, gallery.title]));

  const places = new Map<string, Map<string, { title: string; count: number; href: string }>>();
  const add = (place: string, key: string, title: string, href: string) => {
    const items = places.get(place) ?? new Map();
    places.set(place, items);
    const item = items.get(key) ?? { title, count: 0, href };
    item.count++;
    items.set(key, item);
  };
  for (const photo of photos) {
    const vehicle = vehicles.get(vehicleOf(photo) ?? 0);
    if (vehicle?.city_id && cityTitle.has(vehicle.city_id)) {
      add(cityTitle.get(vehicle.city_id)!, 't' + vehicle.entityid, typeTitle.get(vehicle.entityid) ?? 'Транспорт',
        '/list?cid=' + vehicle.city_id);
    } else if (photo.gallery_id > 0 && galleryTitle.has(photo.gallery_id)) {
      add('Галереи', 'g' + photo.gallery_id, galleryTitle.get(photo.gallery_id)!, '/article/' + photo.gallery_id);
    } else {
      add('Прочее', 'other', vehicle ? typeTitle.get(vehicle.entityid) ?? 'Разные фотографии' : 'Разные фотографии', '/update');
    }
  }
  const tail = (place: string) => Number(place === 'Галереи') + Number(place === 'Прочее') * 2;
  return [...places].map(([place, items]) => ({ place, items: [...items.values()] }))
    .sort((a, b) => tail(a.place) - tail(b.place) || collator.compare(a.place, b.place));
}

async function latestWinner(): Promise<HomeData['contestWinner']> {
  const winner = await database.contestWinner.findFirst({ orderBy: [{ date: 'desc' }, { contest_id: 'desc' }, { place: 'asc' }] });
  if (!winner) return null;
  const [photo, contest] = await Promise.all([
    database.photo.findFirst({ where: { id: winner.photo_id, moderated: 1 }, select: { photourl: true } }),
    database.contest.findUnique({ where: { id: winner.contest_id }, select: { themeid: true } }),
  ]);
  if (!photo) return null;
  const theme = contest ? await database.contestTheme.findUnique({ where: { id: contest.themeid }, select: { title: true } }) : null;
  return { photoId: winner.photo_id, photourl: photo.photourl, place: winner.place, theme: theme?.title ?? '' };
}

@Controller('api/internal')
export class HomeController {
  constructor(private readonly auth: AuthService) {}

  @Get('about')
  async about(): Promise<SiteOverview> {
    const now = Math.floor(Date.now() / 1000);
    const [users, photos, online, staff] = await Promise.all([
      database.user.count(),
      database.photo.count({ where: { moderated: 1 } }),
      database.user.count({ where: { online: { gte: now - 300 } } }),
      database.user.findMany({
        where: { admin: { in: [1, 2, 3] } },
        select: { id: true, username: true, photourl: true, admin: true },
        orderBy: { id: 'asc' },
      }),
    ]);
    return { users, photos, online, staff };
  }

  @Get('top30')
  topPhotos() {
    const since = Math.floor(Date.now() / 1000) - day;
    return database.$queryRaw<TopPhoto[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, p.user_id AS authorId,
        COALESCE(u.username, '') AS author, CAST(v.views AS DOUBLE) AS views
      FROM (SELECT photo_id, COUNT(*) AS views FROM photos_views
            WHERE time >= ${since} GROUP BY photo_id ORDER BY views DESC, photo_id LIMIT 30) v
      JOIN photos p ON p.id = v.photo_id
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.moderated = 1 ORDER BY v.views DESC, p.id`);
  }

  /** The home page: the blocks this visitor may see (guests and signed-in visitors differ) and their data. */
  @Get('home')
  @Header('Cache-Control', 'private, no-store')
  async home(@Req() request: Request): Promise<HomeData> {
    const now = Math.floor(Date.now() / 1000);
    const [settings, signedIn] = await Promise.all([homeBlocks(), this.auth.signedIn(request)]);
    const blocks = settings.filter(block => blockVisible(block, signedIn));
    const shown = new Set<HomeBlockKey>(blocks.map(block => block.key));
    const on = (key: HomeBlockKey) => shown.has(key);

    const [popular, discussed, random, online, siteNews, transportNews, recent, contest, types, comments, summary] = await Promise.all([
      when(on('popular'), () => ranked(Prisma.sql`SELECT photo_id, COUNT(*) AS n FROM photos_views
        WHERE time >= ${now - day} GROUP BY photo_id ORDER BY n DESC LIMIT 10`), []),
      when(on('discussed'), () => ranked(Prisma.sql`SELECT c.photo_id, COUNT(*) AS n FROM photos_comments c
        WHERE c.posted_at >= ${now - day} AND ${commentNotDeleted} GROUP BY c.photo_id ORDER BY n DESC LIMIT 10`), []),
      when(on('random'), () => database.$queryRaw<HomeData['random']>(Prisma.sql`
        SELECT id, photourl, posted_at, place FROM photos WHERE moderated = 1 ORDER BY RAND() LIMIT 7`), []),
      when(on('online'), () => database.user.findMany({
        where: { online: { gte: now - 300 } }, orderBy: { online: 'desc' }, select: { id: true, username: true } }), []),
      when(on('siteNews'), () => news(NewsKind.Site, 10), []),
      when(on('transportNews'), () => news(NewsKind.Transport, 15), []),
      when(on('recent'), () => database.photo.findMany({
        where: { moderated: 1 }, orderBy: { id: 'desc' }, take: 30, select: { id: true } }), []),
      when(on('contest'), () => database.contest.findFirst({
        where: { status: { in: [1, 2] } }, orderBy: [{ status: 'desc' }, { id: 'asc' }] }), null),
      when(on('vehicleSearch'), vehicleTypes, []),
      when(on('discussions'), discussions, []),
      when(on('daily'), () => daily(now), []),
    ]);
    const theme = contest ? await database.contestTheme.findUnique({ where: { id: contest.themeid }, select: { title: true } }) : null;
    const contestWinner = on('contest') && !contest ? await latestWinner() : null;
    const count = <T extends { count: number }>(rows: T[]) => rows.map(row => ({ ...row, count: Number(row.count) }));
    return {
      blocks: blocks.map(({ key, column, title, body }) => ({ key, column, title, body })),
      popular: count(popular), discussed: count(discussed), random, online, siteNews, transportNews, recent,
      contest: contest && { ...contest, theme: theme?.title ?? '' }, contestWinner,
      vehicleTypes: types, discussions: comments, daily: summary,
    };
  }
}
