import { Body, Controller, Get, Header, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { parseId } from '../common/ids';

const now = () => Math.floor(Date.now() / 1000);
const open = () => ({ status: 1, openpretendsdate: { lte: now() }, closepretendsdate: { gte: now() } });
const invalid = { errorcode: 1, error: 0 };

@Controller('api')
export class ContestEntriesController {
  constructor(private readonly auth: AuthService) {}

  @Get('contests/entries')
  @Header('Cache-Control', 'private, no-store')
  async entries() {
    const contest = await database.contest.findFirst({ where: { status: 1 }, orderBy: { id: 'asc' } });
    if (!contest) return { contest: null, photos: [] };
    const photos = await database.$queryRaw<{ id: number; url: string; body: string; place: string; views: bigint }[]>(Prisma.sql`
      SELECT p.id, p.photourl AS url, p.postbody AS body, p.place,
        (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views
      FROM photos p WHERE p.moderated = 1 AND p.on_contest = 1 AND p.contest_id = ${contest.id}
      ORDER BY (SELECT COUNT(*) FROM photos_rates_contest r WHERE r.photo_id = p.id AND r.contest_id = ${contest.id}) DESC, p.id
    `);
    return { contest: contest.id, photos: photos.map(photo => ({ ...photo, views: Number(photo.views) })) };
  }

  @Get('contests/entry-options')
  @Header('Cache-Control', 'private, no-store')
  async options(@Req() request: Request) {
    const viewer = await this.auth.requireViewer(request);
    const [contests, photos] = await Promise.all([
      database.contest.findMany({ where: open(), orderBy: { id: 'asc' } }),
      database.photo.findMany({
        where: { user_id: viewer.id, moderated: 1, on_contest: 0 },
        orderBy: { id: 'desc' }, select: { id: true, place: true },
      }),
    ]);
    const themes = await database.contestTheme.findMany({ where: { id: { in: contests.map(contest => contest.themeid) } } });
    const titles = new Map(themes.map(theme => [theme.id, theme.title]));
    return { contests: contests.map(contest => ({ id: contest.id, title: titles.get(contest.themeid) ?? '' })), photos };
  }

  @Post('photo/contests/sendpretend')
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async submit(@Req() request: Request, @Body('cid') cid: unknown, @Body('photo_id') photo: unknown) {
    const viewer = await this.auth.requireViewer(request);
    const contest = parseId(cid);
    const photoId = parseId(photo);
    if (!contest || !photoId) return JSON.stringify(invalid);
    const saved = await database.$transaction(async tx => {
      const time = now();
      const active = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT id FROM contests WHERE id = ${contest} AND status = 1
          AND openpretendsdate <= ${time} AND closepretendsdate >= ${time} FOR UPDATE
      `);
      if (!active.length) return false;
      const previous = await tx.photo.findFirst({ where: { contest_id: contest, user_id: viewer.id }, select: { id: true } });
      if (previous) return previous.id === photoId;
      const result = await tx.photo.updateMany({
        where: { id: photoId, user_id: viewer.id, moderated: 1, on_contest: 0 },
        data: { contest_id: contest, on_contest: 1 },
      });
      return result.count === 1;
    });
    return JSON.stringify(saved ? { errorcode: 0, error: 0 } : invalid);
  }
}
