import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function profileFields(raw: string) {
  let content: Record<string, unknown> = {};
  try { content = JSON.parse(raw) ?? {}; } catch {}
  function field(key: string) {
    const item = content[key];
    const value = item && typeof item === 'object' && 'value' in item ? item.value : item;
    return typeof value === 'string' ? value : '';
  }
  return { registered: typeof content.regdate === 'number' ? content.regdate : 0,
    city: field('aboutlive'), languages: field('aboutlangs'), about: field('about'), badge: field('badge') };
}

@Controller('api/internal')
export class AuthorController {
  constructor(private readonly auth: AuthService) {}

  @Get('author/:id')
  @Header('Cache-Control', 'private, no-store')
  async author(@Req() request: Request, @Param('id') raw: string) {
    const id = Number(raw);
    if (!/^\d{1,10}$/.test(raw) || id < 1 || id > 2147483647) throw new NotFoundException();
    const [viewer, user, followers] = await Promise.all([
      this.auth.viewer(request),
      database.user.findUnique({ where: { id }, select: { id: true, username: true, admin: true, photourl: true, online: true, content: true } }),
      database.follower.count({ where: { user_id: id } }),
    ]);
    if (!user) throw new NotFoundException();
    const own = viewer?.id === id;
    const subscribed = viewer && !own ? await database.follower.findFirst({
      where: { user_id: id, follower_id: viewer.id }, select: { id: true },
    }) : null;
    const { content, ...profile } = user;
    return { ...profile, ...profileFields(content), own, signedIn: !!viewer, followers, subscribed: !!subscribed };
  }
}
