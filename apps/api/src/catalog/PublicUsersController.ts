import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { database } from '@nativegallery/database';

const publicFields = { id: true, username: true, photourl: true } as const;
const missing = { error: 1, errorcode: 'Пользователь не найден' };

function registrationDate(content: string) {
  try {
    const value: unknown = JSON.parse(content)?.regdate;
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
}

@Controller('api/users')
export class PublicUsersController {
  @Get('search')
  @Header('Cache-Control', 'no-store')
  async search(@Query('q') raw: unknown) {
    if (typeof raw !== 'string' || raw.length > 255 || !raw.trim()) return [];
    return database.user.findMany({
      where: { username: { contains: raw.trim().replace(/[\\%_]/g, '\\$&') } },
      orderBy: { id: 'asc' }, take: 10, select: publicFields,
    });
  }

  @Get('load/:id')
  @Header('Cache-Control', 'no-store')
  async load(@Param('id') rawId: string) {
    const id = Number(rawId);
    if (!/^\d{1,10}$/.test(rawId) || id < 1 || id > 2147483647) return missing;
    const user = await database.user.findUnique({
      where: { id }, select: { ...publicFields, online: true, content: true },
    });
    if (!user) return missing;
    const { content, ...profile } = user;
    return [{ ...profile, regdate: registrationDate(content) }];
  }
}
