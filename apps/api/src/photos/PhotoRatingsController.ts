import { Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function id(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 0;
  const result = Number(value);
  return result <= 2147483647 ? result : 0;
}

@Controller('api/photo')
export class PhotoRatingsController {
  constructor(private readonly auth: AuthService) {}

  @Get('vote')
  @Header('Cache-Control', 'private, no-store')
  async vote(@Req() request: Request, @Query() query: Record<string, unknown>) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const photoId = id(query.pid);
    const contestId = id(query.cid);
    const contest = query.action === 'vote-konk';
    if (!photoId || (query.vote !== '0' && query.vote !== '1') || (contest && !contestId)) return '';
    const type = Number(query.vote);

    return database.$transaction(async tx => {
      const [photo] = await tx.$queryRaw<{ id: number; contest_id: number; on_contest: number }[]>(Prisma.sql`
        SELECT id, contest_id, on_contest FROM photos
        WHERE id = ${photoId} AND (moderated = 1 OR user_id = ${viewer.id} OR ${viewer.admin} > 0)
        FOR UPDATE`);
      if (!photo) return '';

      const ordinary = { photo_id: photoId, user_id: viewer.id, contest: 0 };
      const entry = { photo_id: photoId, user_id: viewer.id, contest_id: contestId };
      if (contest) {
        if (photo.contest_id !== contestId || !photo.on_contest) return '';
        const previous = await tx.photoContestRate.findFirst({ where: entry, orderBy: { id: 'asc' } });
        await tx.photoContestRate.deleteMany({ where: entry });
        if (previous?.type !== type) await tx.photoContestRate.create({ data: { ...entry, type } });
      } else {
        const previous = await tx.photoRate.findFirst({ where: ordinary, orderBy: { id: 'asc' } });
        await tx.photoRate.deleteMany({ where: ordinary });
        if (previous?.type !== type) await tx.photoRate.create({ data: { ...ordinary, type } });
      }

      const [votes, current, currentContest, contestVotes] = await Promise.all([
        tx.photoRate.findMany({ where: { photo_id: photoId }, orderBy: { id: 'desc' } }),
        tx.photoRate.findFirst({ where: ordinary, orderBy: { id: 'asc' } }),
        contestId ? tx.photoContestRate.findFirst({ where: entry, orderBy: { id: 'asc' } }) : null,
        contest ? tx.photoContestRate.findMany({ where: { photo_id: photoId, contest_id: contestId }, select: { type: true } }) : [],
      ]);
      const users = await tx.user.findMany({
        where: { id: { in: [...new Set(votes.map(vote => vote.user_id))] } },
        select: { id: true, username: true },
      });
      const names = new Map(users.map(user => [user.id, user.username]));
      const format = (type: number) => votes.filter(vote => vote.type === type)
        .map(vote => [vote.user_id, names.get(vote.user_id) ?? null, type]);
      return {
        buttons: {
          negbtn: current?.type === 0, posbtn: current?.type === 1,
          negbtn_contest: currentContest?.type === 0, posbtn_contest: currentContest?.type === 1,
        },
        errors: '',
        rating: (contest ? contestVotes : votes).reduce((total, vote) => total + (vote.type === 1 ? 1 : -1), 0),
        votes: { 1: format(1), 0: format(0) },
      };
    });
  }
}
