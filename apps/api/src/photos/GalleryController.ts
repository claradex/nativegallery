import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { GalleryData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';

@Controller('api/internal/galleries')
export class GalleryController {
  @Get(':id')
  async gallery(@Param('id') rawId: string): Promise<GalleryData> {
    const id = Number(rawId);
    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const gallery = await database.gallery.findUnique({ where: { id }, select: { title: true } });
    if (!gallery) throw new NotFoundException();

    const photos = await database.photo.findMany({
      where: { gallery_id: id, moderated: 1 }, orderBy: { id: 'desc' }, take: 100,
      select: { id: true, photourl: true, postbody: true, place: true, posted_at: true, user_id: true },
    });
    const [authors, views] = await Promise.all([
      database.user.findMany({
        where: { id: { in: [...new Set(photos.map(photo => photo.user_id))] } },
        select: { id: true, username: true },
      }),
      database.photoView.groupBy({
        by: ['photo_id'], where: { photo_id: { in: photos.map(photo => photo.id) } }, _count: { photo_id: true },
      }),
    ]);
    const names = new Map(authors.map(author => [author.id, author.username]));
    const totals = new Map(views.map(view => [view.photo_id, view._count.photo_id]));
    return { title: gallery.title, photos: photos.map(({ posted_at, user_id, ...photo }) => ({
      ...photo, postedAt: posted_at, authorId: user_id,
      author: names.get(user_id) ?? '', views: totals.get(photo.id) ?? 0,
    })) };
  }
}
