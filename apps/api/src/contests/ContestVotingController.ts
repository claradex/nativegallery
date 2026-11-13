import { Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function parseId(value: unknown) {
  const id = typeof value === 'string' && /^\d{1,10}$/.test(value) ? Number(value) : 0;
  return id > 0 && id <= 2147483647 ? id : 0;
}

@Controller('api')
export class ContestVotingController {
  constructor(private readonly auth: AuthService) {}

  @Get('contests/voting')
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    const contest = await database.contest.findFirst({ where: { status: 2 }, orderBy: { id: 'asc' } });
    if (!contest) {
      const upcoming = await database.contest.findFirst({
        where: { status: { in: [0, 1] } }, orderBy: { opendate: 'asc' }, select: { opendate: true },
      });
      return { contest: null, startsAt: upcoming?.opendate ?? null };
    }
    const id = contest.id;
    const [photos, votes] = await Promise.all([
      database.$queryRaw<{ id: number; url: string; place: string; body: string; date: number; authorId: number; author: string; views: bigint }[]>(Prisma.sql`
        SELECT p.id, p.photourl AS url, p.place, p.postbody AS body, p.posted_at AS date, p.user_id AS authorId,
          COALESCE(u.username, '') AS author, (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views
        FROM photos p LEFT JOIN users u ON u.id = p.user_id
        WHERE p.moderated = 1 AND p.on_contest = 2 AND p.contest_id = ${id} ORDER BY p.id
      `),
      database.contestRate.findMany({ where: { contest_id: id }, select: { user_id: true, photo_id: true } }),
    ]);
    const chosen = new Set(votes.filter(vote => vote.user_id === viewer?.id).map(vote => vote.photo_id));
    return { contest: id, signedIn: !!viewer, voters: new Set(votes.map(vote => vote.user_id)).size, votes: votes.length,
      photos: photos.map(photo => ({ ...photo, views: Number(photo.views), voted: chosen.has(photo.id) })) };
  }

  @Get('photo/contests/rate')
  @Header('Cache-Control', 'private, no-store')
  async vote(@Req() request: Request, @Query('kid') kid: unknown, @Query('pid') pid: unknown) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const contest_id = parseId(kid);
    const photo_id = parseId(pid);
    if (!contest_id || !photo_id) return '';
    const user_id = viewer.id;
    return database.$transaction(async tx => {
      const [contest] = await tx.$queryRaw<{ closedate: number }[]>(Prisma.sql`
        SELECT closedate FROM contests WHERE id = ${contest_id} AND status = 2 FOR UPDATE
      `);
      if (!contest || contest.closedate <= Date.now() / 1000) return '';
      const photo = await tx.photo.findFirst({ where: { id: photo_id, contest_id, on_contest: 2, moderated: 1 }, select: { id: true } });
      if (!photo) return '';
      const key = { user_id, photo_id, contest_id };
      const removed = await tx.contestRate.deleteMany({ where: key });
      const count = await tx.contestRate.count({ where: { user_id, contest_id } });
      if (!removed.count && count >= 3) return [{ [photo_id]: 0 }, 'Вы можете выбрать максимум 3 фотографии.'];
      if (!removed.count) await tx.contestRate.create({ data: key });
      const left = 3 - count - (removed.count ? 0 : 1);
      return [{ [photo_id]: removed.count ? 0 : 1 }, left > 0 ? 'Вы можете выбрать ещё ' + left + ' фото.'
        : 'Вы выбрали 3 фотографии. Спасибо за голосование!'];
    });
  }
}
