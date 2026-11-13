import { Controller, Get } from '@nestjs/common';
import { publishedPhotos } from './PublishedPhotos';

@Controller('api/internal/feed')
export class FeedController {
  @Get()
  feed() {
    return publishedPhotos();
  }
}
