import { Controller, ForbiddenException, Get, Header, Module, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { TopPhoto } from '@nativegallery/contracts';
import { database, Prisma } from '@nativegallery/database';
import { AuthModule, AuthService } from '../auth/AuthModule';

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return;
  const id = Number(value);
  return id > 0 && id <= 2147483647 ? id : undefined;
}

@Controller('api')
class EngagementController {
  constructor(private readonly auth: AuthService) {}

  @Get('internal/favorite-photos')
  @Header('Cache-Control', 'private, no-store')
  async favorites(@Req() request: Request): Promise<TopPhoto[]> {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const rows = await database.$queryRaw<(Omit<TopPhoto, 'views'> & { views: bigint })[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.posted_at AS timeupload, p.user_id AS authorId,
             COALESCE(u.username, '') AS author,
             (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views
      FROM photos_favorite f
      JOIN photos p ON p.id = f.photo_id
      LEFT JOIN users u ON u.id = p.user_id
      WHERE f.user_id = ${viewer.id}
        AND (p.moderated = 1 OR p.user_id = ${viewer.id} OR ${viewer.admin} > 0)
      ORDER BY f.id DESC LIMIT 100
    `);
    return rows.map(row => ({ ...row, views: Number(row.views) }));
  }

  @Get('photo/:id/favorite')
  @Header('Cache-Control', 'private, no-store')
  async favorite(@Req() request: Request, @Param('id') id: string) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const photoId = parseId(id);
    if (!photoId) return '';
    return database.$transaction(async tx => {
      const target = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM photos WHERE id = ${photoId} AND (moderated = 1 OR user_id = ${viewer.id} OR ${viewer.admin} > 0) FOR UPDATE`);
      if (!target.length) return '';
      const where = { photo_id: photoId, user_id: viewer.id };
      if ((await tx.photoFavorite.deleteMany({ where })).count) return '0';
      await tx.photoFavorite.create({ data: where });
      return '1';
    });
  }

  @Get('subscribe')
  @Header('Cache-Control', 'private, no-store')
  async subscribe(@Req() request: Request, @Query('id') id: unknown) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const authorId = parseId(id);
    if (!authorId || authorId === viewer.id) return '';
    return database.$transaction(async tx => {
      const target = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM users WHERE id = ${authorId} FOR UPDATE`);
      if (!target.length) return '';
      const where = { user_id: authorId, follower_id: viewer.id };
      if ((await tx.follower.deleteMany({ where })).count) return '0';
      await tx.follower.create({ data: where });
      return '1';
    });
  }
}

@Module({ imports: [AuthModule], controllers: [EngagementController] })
export class EngagementModule {}
