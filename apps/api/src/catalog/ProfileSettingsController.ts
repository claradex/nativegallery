import { Body, Controller, ForbiddenException, Get, Header, HttpCode, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { profileFields } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';
import { storeAvatar } from './ProfileAvatar';

function profileContent(raw: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {}
  return {};
}

@Controller('api/profile')
export class ProfileSettingsController {
  constructor(private readonly auth: AuthService) {}

  @Get('settings')
  @Header('Cache-Control', 'private, no-store')
  async settings(@Req() request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const user = await database.user.findUniqueOrThrow({ where: { id: viewer.id }, select: { content: true, photourl: true } });
    const content = profileContent(user.content);
    const fields = Object.fromEntries(profileFields.map(key => {
      const item = content[key];
      const value = item && typeof item === 'object' && 'value' in item ? item.value : item;
      return [key, typeof value === 'string' || typeof value === 'number' ? String(value) : ''];
    }));
    return { id: viewer.id, username: viewer.username, photourl: user.photourl, fields };
  }

  @Post('update')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @UseInterceptors(FileInterceptor('userphoto', { limits: { fileSize: 200 * 1024, fields: 30, fieldSize: 65535 } }))
  async update(@Req() request: Request, @Body() body: Record<string, unknown>, @UploadedFile() file?: { buffer: Buffer }) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const avatar = file && await storeAvatar(file.buffer);
    if (file && !avatar) return 'Требуется изображение JPEG шириной до 800 пикселей.';
    try {
      await database.$transaction(async transaction => {
        const user = await transaction.user.findUniqueOrThrow({ where: { id: viewer.id }, select: { content: true } });
        const content = profileContent(user.content);
        for (const key of profileFields) {
          const value = body?.[key];
          if (typeof value !== 'string') continue;
          const existing = content[key];
          content[key] = { ...(existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {}), value };
        }
        await transaction.user.update({
          where: { id: viewer.id },
          data: { content: JSON.stringify(content), photourl: avatar ? avatar.url : body?.remove_userphoto === 'on' ? '' : undefined },
        });
      });
    } catch (error) {
      if (avatar) await avatar.discard();
      throw error;
    }
    return avatar || body?.remove_userphoto === 'on' ? 'refresh' : '';
  }
}
