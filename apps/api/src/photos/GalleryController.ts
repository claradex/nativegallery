import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { GalleryData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { publishedPhotos } from './PublishedPhotos';

@Controller('api/internal/galleries')
export class GalleryController {
  @Get(':id')
  async gallery(@Param('id') rawId: string): Promise<GalleryData> {
    const id = Number(rawId);
    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const gallery = await database.gallery.findUnique({ where: { id }, select: { title: true } });
    if (!gallery) throw new NotFoundException();

    return { title: gallery.title, photos: await publishedPhotos(id) };
  }
}
