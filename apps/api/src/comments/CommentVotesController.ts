import { Controller, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { metadata } from './CommentMetadata';
import { parseId } from '../common/ids';

@Controller('api/photo/comment')
export class CommentVotesController {
  constructor(private readonly auth: AuthService) {}

  @Get('rate')
  @Header('Cache-Control', 'private, no-store')
  async rate(@Req() request: Request, @Query('wid') rawId: unknown, @Query('vote') vote: unknown) {
    const viewer = await this.auth.requireViewer(request);
    const id = parseId(rawId);
    if (!id || (vote !== '0' && vote !== '1')) return '';
    const type = Number(vote);
    return database.$transaction(async tx => {
      const [comment] = await tx.$queryRaw<{ id: number; content: string }[]>(Prisma.sql`
        SELECT c.id, c.content FROM photos_comments c JOIN photos p ON p.id = c.photo_id
        WHERE c.id = ${id} AND (p.moderated = 1 OR p.user_id = ${viewer.id} OR ${viewer.admin} > 0) FOR UPDATE`);
      if (!comment || metadata(comment.content).deleted === 'true') return '';
      const where = { user_id: viewer.id, comment_id: id };
      const previous = await tx.photoCommentRate.findFirst({ where, orderBy: { id: 'asc' } });
      const selected = previous?.type === type ? null : type;
      await tx.photoCommentRate.deleteMany({ where });
      if (selected !== null) await tx.photoCommentRate.create({ data: { ...where, type: selected } });
      const counts = await tx.photoCommentRate.groupBy({ by: ['type'], where: { comment_id: id }, _count: { type: true } });
      const positive = counts.find(count => count.type === 1)?._count.type ?? 0;
      const negative = counts.find(count => count.type === 0)?._count.type ?? 0;
      return [{ 1: selected === 1, 0: selected === 0 }, { 1: positive, 0: -negative || 0 }, positive - negative];
    });
  }
}
