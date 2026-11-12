import { Controller, ForbiddenException, Get, Module, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthModule, AuthService } from '../auth/AuthModule';

@Controller('api')
class CatalogController {
  constructor(private readonly auth: AuthService) {}

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

@Module({ imports: [AuthModule], controllers: [CatalogController] })
export class CatalogModule {}
