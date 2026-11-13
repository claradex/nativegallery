import { newsHtml } from '../news/NewsHtml';
import { Controller, Get } from '@nestjs/common';
import type { SiteOverview, TopPhoto } from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';

@Controller('api/internal')
export class HomeController {
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
    const since = Math.floor(Date.now() / 1000) - 86400;
    return database.$queryRaw<TopPhoto[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, p.user_id AS authorId,
        COALESCE(u.username, '') AS author, CAST(v.views AS DOUBLE) AS views
      FROM (SELECT photo_id, COUNT(*) AS views FROM photos_views
            WHERE time >= ${since} GROUP BY photo_id ORDER BY views DESC, photo_id LIMIT 30) v
      JOIN photos p ON p.id = v.photo_id
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.moderated = 1 ORDER BY v.views DESC, p.id`);
  }

  @Get('home')
  async home() {
    const now = Math.floor(Date.now() / 1000);
    const [popular, random, online, news, recent, contests] = await Promise.all([
      database.$queryRaw<{ id: number; photourl: string; priority: number; views: number }[]>(Prisma.sql`
        SELECT p.id, p.photourl, p.priority, CAST(v.views AS DOUBLE) AS views
        FROM (SELECT photo_id, COUNT(*) AS views FROM photos_views
              WHERE time >= ${now - 86400} GROUP BY photo_id ORDER BY views DESC LIMIT 10) v
        JOIN photos p ON p.id = v.photo_id WHERE p.moderated = 1 ORDER BY v.views DESC`),
      database.$queryRaw<{ id: number; photourl: string; posted_at: number; place: string }[]>(Prisma.sql`
        SELECT id, photourl, posted_at, place FROM photos WHERE moderated = 1 ORDER BY RAND() LIMIT 7`),
      database.user.findMany({ where: { online: { gte: now - 300 } }, orderBy: { online: 'desc' }, select: { id: true, username: true } }),
      database.news.findMany({ orderBy: { id: 'desc' }, take: 10, select: { body: true, time: true } }),
      database.photo.findMany({ where: { moderated: 1 }, orderBy: { id: 'desc' }, take: 30, select: { id: true } }),
      database.contest.findFirst({ where: { status: { in: [1, 2] } }, orderBy: [{ status: 'desc' }, { id: 'asc' }] }),
    ]);
    const theme = contests ? await database.contestTheme.findUnique({ where: { id: contests.themeid }, select: { title: true } }) : null;
    return { popular, random, online, news: news.map(item => ({ ...item, body: newsHtml(item.body) })), recent, contest: contests && { ...contests, theme: theme?.title ?? '' } };
  }
}
