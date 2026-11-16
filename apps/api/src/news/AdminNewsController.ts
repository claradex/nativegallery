import { All, BadRequestException, Body, Controller, Get, Header, NotFoundException, Param, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { legacyDate } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { newsHtml } from './NewsHtml';
import { requireId } from '../common/ids';
import { GeoKind, newsKinds } from '@nativegallery/contracts';

/** `kind` and `city_id` of a news item from a form body; the city must be a GeoDB city and only goes with transport news. */
async function newsMeta(body: Record<string, unknown>) {
  const kind = body?.kind === undefined || body.kind === '' ? 0 : Number(body.kind);
  if (!newsKinds.some(item => item.id === kind)) throw new BadRequestException();
  const raw = body?.city_id;
  const city_id = kind === 0 || raw === undefined || raw === null || raw === '' || raw === '0' ? null : requireId(raw, BadRequestException);
  if (city_id && !await database.geoEntry.count({ where: { id: city_id, kind: GeoKind.City } })) {
    throw new BadRequestException('Выберите город из GeoDB.');
  }
  return { kind, city_id };
}

const success = '{"errorcode":0,"error":0}';

@Controller('api/admin')
export class AdminNewsController {
  constructor(private readonly auth: AuthService) {}

  @Get('news')
  @Header('Cache-Control', 'private, no-store')
  async news(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'moderator');
    const rows = await database.news.findMany({ orderBy: [{ time: 'desc' }, { id: 'desc' }] });
    return rows.map(row => ({ ...row, body: newsHtml(row.body) }));
  }

  @All('loadnews')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async load(@Req() request: Request) {
    return (await this.news(request)).map(row =>
      '<div class="card mb-3"><div class="card-body"><i>' + legacyDate(row.time) +
      '</i><br>' + row.body + '<br><a class="btn btn-danger mt-3" href="#" data-news-delete="' +
      row.id + '">Удалить</a></div></div>').join('');
  }

  @All('news/create')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async create(@Req() request: Request, @Body() form: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'moderator');
    const value = form?.body;
    if (typeof value !== 'string' || Buffer.byteLength(value) > 256_000) throw new BadRequestException();
    const body = newsHtml(value).trim();
    if (!body) throw new BadRequestException();
    await database.news.create({ data: { body, time: Math.floor(Date.now() / 1000), ...await newsMeta(form) } });
    return success;
  }

  @All('news/:id/delete')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async remove(@Req() request: Request, @Param('id') value: string) {
    await this.auth.requireAdmin(request, 'moderator');
    const id = requireId(value, BadRequestException);
    await database.news.deleteMany({ where: { id } });
    return success;
  }

  @Patch('news/:id')
  @Header('Cache-Control', 'private, no-store')
  async update(@Req() request: Request, @Param('id') value: string, @Body() form: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'moderator');
    const raw = form?.body;
    const id = requireId(value, BadRequestException);
    if (typeof raw !== 'string' || Buffer.byteLength(raw) > 256_000) throw new BadRequestException();
    const body = newsHtml(raw).trim();
    if (!body) throw new BadRequestException();
    const result = await database.news.updateMany({ where: { id }, data: { body, ...await newsMeta(form) } });
    if (!result.count) throw new NotFoundException();
    return { id };
  }
}
