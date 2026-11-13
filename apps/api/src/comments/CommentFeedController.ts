import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { CommentFeedEntry } from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';

type FeedRow = Omit<CommentFeedEntry, 'photoCount' | 'positive' | 'negative'>;

@Controller('api/internal/comment-feed')
export class CommentFeedController {
  @Get()
  async list(@Query('before') before?: string, @Query('after') after?: string): Promise<CommentFeedEntry[]> {
    const valid = (value: string | undefined) => value === undefined ||
      (typeof value === 'string' && /^\d{1,10}$/.test(value) && Number(value) <= 2147483647);
    if (!valid(before) || !valid(after) || (before !== undefined && after !== undefined)) throw new BadRequestException();
    const cursor = before !== undefined ? Prisma.sql`AND c.id < ${Number(before)}`
      : after !== undefined ? Prisma.sql`AND c.id > ${Number(after)}` : Prisma.empty;
    const order = after === undefined ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    const rows = await database.$queryRaw<FeedRow[]>(Prisma.sql`
      SELECT c.id, c.photo_id AS photoId, p.photourl AS photoUrl,
        c.user_id AS authorId, COALESCE(u.username, '') AS author,
        COALESCE(u.admin, 0) AS admin, c.body, c.posted_at AS postedAt
      FROM photos_comments c
      JOIN photos p ON p.id = c.photo_id AND p.moderated = 1
      LEFT JOIN users u ON u.id = c.user_id
      WHERE COALESCE(JSON_UNQUOTE(JSON_EXTRACT(
        CASE WHEN JSON_VALID(c.content) THEN c.content ELSE '{}' END, '$.deleted'
      )), '') <> 'true'
      ${cursor}
      ORDER BY c.id ${order} LIMIT 30
    `);
    if (after !== undefined) rows.reverse();
    const [counts, votes] = await Promise.all([
      database.photo.groupBy({
        by: ['user_id'], where: { user_id: { in: [...new Set(rows.map(row => row.authorId))] } }, _count: { _all: true },
      }),
      database.photoCommentRate.groupBy({
        by: ['comment_id', 'type'], where: { comment_id: { in: rows.map(row => row.id) } }, _count: { _all: true },
      }),
    ]);
    const totals = new Map(counts.map(count => [count.user_id, count._count._all]));
    const scores = new Map(votes.map(vote => [vote.comment_id + ':' + vote.type, vote._count._all]));
    return rows.map(row => ({ ...row, photoCount: totals.get(row.authorId) ?? 0,
      positive: scores.get(row.id + ':1') ?? 0, negative: scores.get(row.id + ':0') ?? 0 }));
  }
}
