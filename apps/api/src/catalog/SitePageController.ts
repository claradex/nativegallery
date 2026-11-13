import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { database } from '@nativegallery/database';
import type { SitePageData } from '@nativegallery/contracts';
import { newsHtml } from '../news/NewsHtml';

@Controller('api/internal/pages')
export class SitePageController {
  @Get(':id')
  async page(@Param('id') rawId: string): Promise<SitePageData> {
    const id = Number(rawId);
    if (!/^\d{1,10}$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const page = await database.page.findUnique({ where: { id }, select: { title: true, body: true } });
    if (!page) throw new NotFoundException();
    return { title: page.title, html: newsHtml(page.body) };
  }
}
