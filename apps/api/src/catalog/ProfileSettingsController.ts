import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, HttpCode, Param, ParseIntPipe, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import { profileFields, type ProfileSession } from '@nativegallery/contracts';
import { AuthService, sessionToken } from '../auth/AuthService';
import { storeAvatar } from './ProfileAvatar';

const themes = new Set(['standard', 'nativegallery-dark']);

export const preferenceCookie = (path: string) =>
  ({ path, httpOnly: true, sameSite: 'lax' as const, secure: process.env.COOKIE_SECURE === 'true' });

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

  @Get('sessions')
  @Header('Cache-Control', 'private, no-store')
  async sessions(@Req() request: Request): Promise<ProfileSession[]> {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const current = 'v2:' + sessionToken(request);
    const rows = await database.loginToken.findMany({
      where: { user_id: viewer.id }, orderBy: { last_activity: 'desc' },
      select: { id: true, token: true, device_name: true, os: true, last_activity: true },
    });
    return rows.map(row => ({ id: row.id, device: row.device_name, os: row.os,
      lastActivity: Number(row.last_activity), current: row.token === current }));
  }

  /** Ends one of the viewer's other sessions; the current one is left to /logout. */
  @Post('sessions/:id/delete')
  async endSession(@Req() request: Request, @Res() response: Response, @Param('id', ParseIntPipe) id: number) {
    response.setHeader('Cache-Control', 'private, no-store');
    const viewer = await this.auth.viewer(request);
    if (!viewer) return response.redirect(303, '/login');
    await database.loginToken.deleteMany({
      where: { id, user_id: viewer.id, NOT: { token: 'v2:' + sessionToken(request) } },
    });
    response.redirect(303, '/lk/profile?type=Security');
  }

  /** Theme choice lives in a cookie so the frontend can pick the stylesheet scope before any API call. */
  @Post('theme')
  async theme(@Req() request: Request, @Res() response: Response, @Body('theme_id') theme?: unknown) {
    response.setHeader('Cache-Control', 'private, no-store');
    if (!(await this.auth.viewer(request))) return response.redirect(303, '/login');
    if (typeof theme !== 'string' || !themes.has(theme)) throw new BadRequestException();
    response.cookie('NGALLERYTHEME', theme, preferenceCookie('/'));
    response.redirect(303, '/lk/profile?type=Personalization');
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
