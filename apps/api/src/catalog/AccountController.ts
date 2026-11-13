import { BadRequestException, Controller, ForbiddenException, Get, Header, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { preferenceCookie } from './ProfileSettingsController';
import type { UploadHistoryData } from '@nativegallery/contracts';
import { photoContent } from '../photos/PhotoContent';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/internal/account')
export class AccountController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async summary(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const [published, pending, user] = await Promise.all([
      database.photo.count({ where: { user_id: viewer.id, moderated: 1 } }),
      database.photo.count({ where: { moderated: 0 } }),
      database.user.findUnique({ where: { id: viewer.id }, select: { uploadindex: true } }),
    ]);
    return { id: viewer.id, username: viewer.username, published, pending,
      uploadIndex: process.env.UPLOAD_INDEX_ENABLED === 'true' ? user?.uploadindex ?? null : null };
  }

  @Get('upload-index')
  @Header('Cache-Control', 'private, no-store')
  async indexHistory(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return database.uploadIndexHistory.findMany({
      where: { user_id: viewer.id }, orderBy: { id: 'desc' },
      select: { id: true, oldindex: true, newindex: true, date: true, type: true, photo_id: true },
    });
  }

  /** Remembers the upload history ordering for pages under /lk, as the legacy set.php did. */
  @Get('upload-sort')
  uploadSort(@Query('lk_upl_sort') sort: string | undefined, @Res() response: Response) {
    if (sort !== '0' && sort !== '1' && sort !== '2') throw new BadRequestException();
    response.setHeader('Cache-Control', 'private, no-store');
    response.cookie('lk_upl_sort', sort, preferenceCookie('/lk'));
    response.redirect(302, '/lk/history');
  }

  @Get('uploads')
  @Header('Cache-Control', 'private, no-store')
  async uploadHistory(@Req() request: Request, @Query('sort') sort?: string): Promise<UploadHistoryData> {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const photos = await database.photo.findMany({
      where: { user_id: viewer.id },
      orderBy: sort === '1' ? [{ endmoderation: 'desc' }, { id: 'desc' }] : { id: 'desc' },
      select: { id: true, photourl: true, place: true, posted_at: true, endmoderation: true, moderated: true, content: true },
    });
    if (sort === '2') photos.sort((a, b) => Number(a.moderated === 1) - Number(b.moderated === 1));
    return {
      author: { id: viewer.id, username: viewer.username },
      photos: photos.map(({ content, ...photo }) => {
        const metadata = photoContent(content);
        return {
          ...photo,
          declineReason: Number(metadata.declineReason) || 0,
          declineComment: typeof metadata.declineComment === 'string' ? metadata.declineComment : null,
          rating: metadata.iRate === 0 ? '-' : '+',
        };
      }),
    };
  }
}
