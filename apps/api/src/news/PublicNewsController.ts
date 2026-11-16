import { Controller, Get, Query } from '@nestjs/common';
import { database } from '@nativegallery/database';
import { newsHtml } from './NewsHtml';

@Controller('api/internal/news')
export class PublicNewsController {
  @Get()
  /** `?kind=0` site news, `?kind=1` transport news; all news without it. */
  async list(@Query('kind') kind?: string) {
    const where = kind === '0' || kind === '1' ? { kind: Number(kind) } : {};
    const items = await database.news.findMany({ where, orderBy: [{ time: 'desc' }, { id: 'desc' }] });
    return items.map(item => ({ ...item, body: newsHtml(item.body) }));
  }
}
