import { All, BadRequestException, Body, Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/admin/geodb')
export class AdminGeoController {
  constructor(private readonly auth: AuthService) {}

  private async authorize(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.authorize(request);
    return database.geoEntry.findMany({ orderBy: { id: 'asc' } });
  }

  @All('load')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async load(@Req() request: Request) {
    return (await this.list(request)).map(({ id, title }) => {
      const label = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<tr id="geodb' + id + '"><th>' + id + '</th><td>' + label +
        '</td><td><div class="cmt-submit"><button type="button" class="btn btn-sm btn-danger" data-geo-delete="' +
        id + '" style="margin-left:15px">Удалить</button></div></td></tr>';
    }).join('');
  }

  @All('create')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async create(@Req() request: Request, @Body('body') title: unknown) {
    await this.authorize(request);
    if (typeof title !== 'string' || !title.trim() || Buffer.byteLength(title) > 65535) throw new BadRequestException();
    await database.geoEntry.create({ data: { title: title.trim() } });
    return '{"errorcode":0,"error":0}';
  }

  @All('delete')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async remove(@Req() request: Request, @Query('id') raw: unknown) {
    await this.authorize(request);
    const id = Number(raw);
    if (typeof raw !== 'string' || !/^\d{1,10}$/.test(raw) || id < 1 || id > 2147483647) throw new BadRequestException();
    await database.geoEntry.deleteMany({ where: { id } });
    return '{"errorcode":0,"error":0}';
  }
}
