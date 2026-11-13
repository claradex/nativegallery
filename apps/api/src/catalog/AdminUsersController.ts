import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, NotFoundException, Param, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';

const userFields = { id: true, username: true, email: true, photourl: true, admin: true, status: true, online: true, content: true } as const;

function metadata(content: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(content);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {}
  return {};
}

@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'owner');
    const users = await database.user.findMany({ select: userFields, orderBy: { id: 'asc' } });
    return users.map(({ content, ...user }) => ({ ...user, directUpload: metadata(content).premoderation === 'true' }));
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async detail(@Req() request: Request, @Param('id') value: string) {
    const viewer = await this.auth.requireAdmin(request, 'owner');
    const user = await database.user.findUnique({ where: { id: requireId(value) }, select: userFields });
    if (!user) throw new NotFoundException();
    const { content, ...fields } = user;
    return { ...fields, directUpload: metadata(content).premoderation === 'true', canChangeAccess: user.id !== viewer.id };
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') value: string, @Body() body: Record<string, unknown>) {
    const viewer = await this.auth.requireAdmin(request, 'owner');
    const id = requireId(value);
    const { premoderation, accountstatus, admin } = body ?? {};
    if (premoderation !== 'true' && premoderation !== 'false') throw new BadRequestException();
    if (accountstatus !== undefined && accountstatus !== '0' && accountstatus !== '1') throw new BadRequestException();
    if (admin !== undefined && admin !== '0' && admin !== '1' && admin !== '2' && admin !== '3') throw new BadRequestException();
    if (id === viewer.id && (accountstatus !== undefined || admin !== undefined)) throw new ForbiddenException();

    await database.$transaction(async tx => {
      const [user] = await tx.$queryRaw<{ content: string }[]>(Prisma.sql`SELECT content FROM users WHERE id = ${id} FOR UPDATE`);
      if (!user) throw new NotFoundException();
      const content = JSON.stringify({ ...metadata(user.content), premoderation });
      if (Buffer.byteLength(content) > 65535) throw new BadRequestException();
      await tx.user.update({ where: { id }, data: {
        content, ...(admin === undefined ? {} : { admin: Number(admin) }),
        ...(accountstatus === undefined ? {} : { status: Number(accountstatus) }),
      } });
      if (accountstatus === '1') await tx.loginToken.deleteMany({ where: { user_id: id } });
    });
    return { id };
  }
}
