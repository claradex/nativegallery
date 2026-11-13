import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';

const profileLabels = [
  [
    "abouttelegram",
    "Telegram:"
  ],
  [
    "aboutvk",
    "ВКонтакте:"
  ],
  [
    "abouttwitter",
    "Twitter/X:"
  ],
  [
    "aboutyoutube",
    "YouTube:"
  ],
  [
    "aboutemail",
    "Почта:"
  ],
  [
    "aboutinstagram",
    "Instagram:"
  ],
  [
    "abouttransphoto",
    "TransPhoto:"
  ],
  [
    "aboutwebsite",
    "Личный сайт:"
  ],
  [
    "aboutfavs_trains",
    "Любимые модели поездов:"
  ],
  [
    "aboutfavs_countries",
    "Любимые страны:"
  ],
  [
    "aboutfavs_cities",
    "Любимые города:"
  ]
] as const;

function profileFields(raw: string) {
  let content: Record<string, unknown> = {};
  try { content = JSON.parse(raw) ?? {}; } catch {}
  function field(key: string) {
    const item = content[key];
    if (item && typeof item === 'object' && 'private' in item && (item.private === true || item.private === 'true')) return '';
    const value = item && typeof item === 'object' && 'value' in item ? item.value : item;
    return typeof value === 'string' ? value : '';
  }
  const registered = Number(content.regdate);
  const contacts = profileLabels.slice(0, 8).map(([key, label]) => ({ label, value: field(key), email: key === 'aboutemail' }));
  const favorites = profileLabels.slice(8).map(([key, label]) => ({ label, value: field(key) }));
  return {
    registered: Number.isSafeInteger(registered) && registered > 0 && registered <= 2147483647 ? registered : 0,
    city: field('aboutlive'), birthday: field('aboutbirthday'), languages: field('aboutlangs'),
    about: field('aboutmemo') || field('about'), badge: field('badge'),
    contacts: contacts.filter(item => item.value), favorites: favorites.filter(item => item.value),
  };
}

@Controller('api/internal')
export class AuthorController {
  constructor(private readonly auth: AuthService) {}

  @Get('author/:id')
  @Header('Cache-Control', 'private, no-store')
  async author(@Req() request: Request, @Param('id') raw: string) {
    const id = requireId(raw);
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
