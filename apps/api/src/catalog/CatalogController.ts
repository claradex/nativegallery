import { Controller, ForbiddenException, Get, Header, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api')
export class CatalogController {
  constructor(private readonly auth: AuthService) {}

  @Get('users/search')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async searchUsers(@Query('q') query: unknown) {
    if (query !== undefined && typeof query !== 'string') return 'null';
    const users = await database.user.findMany({
      where: { username: { contains: query ?? '' } },
      select: { id: true, username: true, photourl: true },
      orderBy: { id: 'asc' }, take: 10,
    });
    return JSON.stringify(users.length ? users : null);
  }

  @Get('users/load/:id')
  async user(@Param('id') id: string) {
    const numericId = Number(id);
    const user = Number.isInteger(numericId) && numericId > 0 && numericId <= 2147483647
      ? await database.user.findUnique({ where: { id: numericId } }) : null;
    if (!user) return { error: 1, errorcode: 'Пользователь не найден' };
    let regdate: unknown = null;
    try { regdate = JSON.parse(user.content)?.regdate ?? null; } catch {}
    return [{ id: user.id, username: user.username, regdate, online: user.online, photourl: user.photourl }];
  }

  @Get('geodb/search')
  async geodb(@Req() request: Request, @Query('place') place: string) {
    if (!await this.auth.viewer(request)) throw new ForbiddenException();
    if (!place || place === '0') return { error: 'No query provided' };
    return (await database.geoEntry.findMany({ where: { title: { contains: place } }, select: { title: true } }))
      .map(entry => entry.title);
  }
}
