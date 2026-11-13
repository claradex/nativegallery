import { BadRequestException, Controller, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import type { PhotoSearchResult } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';

@Controller('api/internal')
export class PhotoSearchController {
  constructor(private readonly auth: AuthService) {}

  @Get('photo-search')
  @Header('Cache-Control', 'private, no-store')
  async search(@Req() request: Request, @Query('id') raw: unknown, @Query('page') rawPage: unknown): Promise<PhotoSearchResult> {
    await this.auth.requireViewer(request);
    const id = typeof raw === 'string' && /^\d{1,10}$/.test(raw) ? Number(raw) : 0;
    const page = rawPage === undefined ? 1 : typeof rawPage === 'string' && /^\d{1,7}$/.test(rawPage) ? Number(rawPage) : 0;
    if (id < 1 || id > 2147483647 || page < 1) throw new BadRequestException();
    const size = 50;
    const [total, rows] = await database.$transaction([
      database.photo.count({ where: { user_id: id, moderated: 1 } }),
      database.$queryRaw<(Omit<PhotoSearchResult['photos'][number], 'comments' | 'views'> & { comments: bigint; views: bigint })[]>(Prisma.sql`
        SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, COALESCE(u.username, '') AS author,
          (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views,
          (SELECT COUNT(*) FROM photos_comments c WHERE c.photo_id = p.id) AS comments
        FROM photos p LEFT JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ${id} AND p.moderated = 1 ORDER BY p.id DESC
        LIMIT ${size} OFFSET ${(page - 1) * size}
      `),
    ]);
    return { authorId: id, total, page, pages: Math.ceil(total / size),
      photos: rows.map(row => ({ ...row, views: Number(row.views), comments: Number(row.comments) })) };
  }
}
