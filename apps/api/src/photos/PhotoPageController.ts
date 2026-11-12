import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { PhotoPageData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/internal')
export class PhotoPageController {
  constructor(private readonly auth: AuthService) {}

  @Get('photo-page/:id')
  @Header('Cache-Control', 'private, no-store')
  async getPhoto(@Param('id') rawId: string, @Req() request: Request): Promise<PhotoPageData> {
    const id = Number(rawId);
    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const viewer = await this.auth.viewer(request);
    const photo = await database.photo.findUnique({
      where: { id },
      select: { id: true, user_id: true, photourl: true, place: true, postbody: true,
        posted_at: true, timeupload: true, moderated: true, content: true },
    });
    if (!photo || (photo.moderated !== 1 && (photo.moderated !== 0 ||
      (!viewer?.admin && viewer?.id !== photo.user_id)))) throw new NotFoundException();
    const [author, views, favorite] = await Promise.all([
      database.user.findUnique({ where: { id: photo.user_id }, select: { username: true } }),
      database.photoView.count({ where: { photo_id: id } }),
      viewer ? database.photoFavorite.findFirst({ where: { photo_id: id, user_id: viewer.id }, select: { id: true } }) : null,
    ]);
    let commentsEnabled = true;
    try { commentsEnabled = JSON.parse(photo.content)?.comments !== 'disabled'; } catch {}
    return {
      id, authorId: photo.user_id, author: author?.username ?? '', url: photo.photourl,
      place: photo.place, description: photo.postbody, takenAt: photo.posted_at, publishedAt: photo.timeupload,
      published: photo.moderated === 1, views, favorite: !!favorite, signedIn: !!viewer, commentsEnabled,
      canComment: !!viewer && (process.env.EMAIL_VERIFY !== "true" || viewer.status !== 3),
    };
  }
}
