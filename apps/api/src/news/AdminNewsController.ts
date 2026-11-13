import { All, BadRequestException, Body, Controller, ForbiddenException, Get, Header, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { legacyDate } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { newsHtml } from './NewsHtml';

const success = '{"errorcode":0,"error":0}';

@Controller('api/admin')
@Header('Cache-Control', 'private, no-store')
export class AdminNewsController {
  constructor(private readonly auth: AuthService) {}

  private async requireAdmin(request: Request) {
    if (!(await this.auth.viewer(request))?.admin) throw new ForbiddenException();
  }

  @Get('news')
  async news(@Req() request: Request) {
    await this.requireAdmin(request);
    const rows = await database.news.findMany({ orderBy: { id: 'asc' } });
    return rows.map(row => ({ ...row, body: newsHtml(row.body) }));
  }

  @All('loadnews')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async load(@Req() request: Request) {
    return (await this.news(request)).map(row =>
      '<div class="card mb-3"><div class="card-body"><i>' + legacyDate(row.time) +
      '</i><br>' + row.body + '<br><a class="btn btn-danger mt-3" href="#" data-news-delete="' +
      row.id + '">Удалить</a></div></div>').join('');
  }

  @All('news/create')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async create(@Req() request: Request, @Body('body') value: unknown) {
    await this.requireAdmin(request);
    if (typeof value !== 'string' || Buffer.byteLength(value) > 256_000) throw new BadRequestException();
    const body = newsHtml(value).trim();
    if (!body) throw new BadRequestException();
    await database.news.create({ data: { body, time: Math.floor(Date.now() / 1000) } });
    return success;
  }

  @All('news/:id/delete')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async remove(@Req() request: Request, @Param('id') value: string) {
    await this.requireAdmin(request);
    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647) throw new BadRequestException();
    await database.news.deleteMany({ where: { id } });
    return success;
  }
}
