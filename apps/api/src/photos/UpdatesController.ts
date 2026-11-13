import { Controller, Get } from '@nestjs/common';
import { publishedPhotos } from './PublishedPhotos';

@Controller('api/internal/updates')
export class UpdatesController {
  @Get()
  list() {
    return publishedPhotos(undefined, Math.floor(Date.now() / 1000) - 72 * 3600);
  }
}
