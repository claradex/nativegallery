import { Controller, ForbiddenException, Get, Header, Redirect, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import type { TopPhoto } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';

@Controller('api')
export class FollowingController {
  constructor(private readonly auth: AuthService) {}

  @Get('internal/followed-photos')
  @Header('Cache-Control', 'private, no-store')
  async photos(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return database.$queryRaw<TopPhoto[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, p.user_id AS authorId,
             COALESCE(u.username, '') AS author,
             (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views
      FROM followers_notifications f
      JOIN photos p ON p.id = f.photo_id AND p.moderated = 1
      LEFT JOIN users u ON u.id = p.user_id
      WHERE f.follower_id = ${viewer.id} AND f.checked = 0
      ORDER BY f.id
    `).then(rows => rows.map(row => ({ ...row, views: Number(row.views) })));
  }

  @Get('photo/checkall')
  @Redirect('/fav_authors', 302)
  @Header('Cache-Control', 'private, no-store')
  async markRead(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    await database.followerNotification.updateMany({
      where: { follower_id: viewer.id, checked: 0 },
      data: { checked: 1 },
    });
  }
}
