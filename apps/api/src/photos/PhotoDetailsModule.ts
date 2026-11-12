import { Controller, Get, Module, NotFoundException, Param } from '@nestjs/common';
import type { PhotoDetailsData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';

@Controller('api/internal')
class PhotoDetailsController {
  @Get('photo-details/:id')
  async details(@Param('id') value: string): Promise<PhotoDetailsData> {
    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647) throw new NotFoundException();
    return database.$transaction(async tx => {
      const photo = await tx.photo.findFirst({
        where: { id, moderated: 1 },
        select: { user_id: true, photourl: true, timeupload: true },
      });
      if (!photo) throw new NotFoundException();
      const [author, views, comments] = await Promise.all([
        tx.user.findUnique({ where: { id: photo.user_id }, select: { username: true } }),
        tx.photoView.count({ where: { photo_id: id } }),
        tx.photoComment.count({ where: { photo_id: id } }),
      ]);
      return { id, url: photo.photourl, author: author?.username ?? '', publishedAt: photo.timeupload, views, comments };
    });
  }
}

@Module({ controllers: [PhotoDetailsController] })
export class PhotoDetailsModule {}
