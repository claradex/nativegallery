import { Controller, Get } from '@nestjs/common';
import { database } from '@nativegallery/database';
import { newsHtml } from './NewsHtml';

@Controller('api/internal/news')
export class PublicNewsController {
  @Get()
  async list() {
    const items = await database.news.findMany({ orderBy: [{ time: 'desc' }, { id: 'desc' }] });
    return items.map(item => ({ ...item, body: newsHtml(item.body) }));
  }
}
