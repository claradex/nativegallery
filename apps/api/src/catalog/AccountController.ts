import { Controller, ForbiddenException, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/internal/account')
export class AccountController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async summary(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const [published, pending, user] = await Promise.all([
      database.photo.count({ where: { user_id: viewer.id, moderated: 1 } }),
      database.photo.count({ where: { moderated: 0 } }),
      database.user.findUnique({ where: { id: viewer.id }, select: { uploadindex: true } }),
    ]);
    return { id: viewer.id, username: viewer.username, published, pending,
      uploadIndex: process.env.UPLOAD_INDEX_ENABLED === 'true' ? user?.uploadindex ?? null : null };
  }

  @Get('upload-index')
  @Header('Cache-Control', 'private, no-store')
  async indexHistory(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return database.uploadIndexHistory.findMany({
      where: { user_id: viewer.id }, orderBy: { id: 'desc' },
      select: { id: true, oldindex: true, newindex: true, date: true, type: true, photo_id: true },
    });
  }
}
