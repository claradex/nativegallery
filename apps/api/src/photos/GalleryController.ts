import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { GalleryData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { publishedPhotos } from './PublishedPhotos';
import { requireId } from '../common/ids';

@Controller('api/internal/galleries')
export class GalleryController {
  @Get()
  list() {
    return database.gallery.findMany({ orderBy: { id: 'asc' }, select: { id: true, title: true } });
  }

  @Get(':id')
  async gallery(@Param('id') rawId: string): Promise<GalleryData> {
    const id = requireId(rawId);
    const gallery = await database.gallery.findUnique({ where: { id }, select: { title: true } });
    if (!gallery) throw new NotFoundException();

    return { title: gallery.title, photos: await publishedPhotos(id) };
  }
}
