import { Controller, Get, Module } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';

@Controller('api/internal')
class HomeController {
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
    return { popular, random, online, news, recent, contest: contests && { ...contests, theme: theme?.title ?? '' } };
  }
}

@Module({ controllers: [HomeController] })
export class HomeModule {}
