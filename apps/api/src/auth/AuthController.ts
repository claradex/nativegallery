import { Body, Controller, Get, Header, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import type { LoginRequest } from '@nativegallery/contracts';
import { AuthService, sessionCookies, sessionToken } from './AuthService';

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async login(@Body() body: Partial<LoginRequest>, @Res({ passthrough: true }) response: Response) {
    return JSON.stringify(await this.auth.login(body, response));
  }

  @Get('internal/logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const token = sessionToken(request);
    if (token) await database.loginToken.deleteMany({ where: { token: 'v2:' + token } });
    for (const name of sessionCookies) response.clearCookie(name, { path: '/' });
    response.setHeader('Cache-Control', 'private, no-store');
    response.redirect(302, '/');
  }

  @Get('internal/viewer')
  @Header('Cache-Control', 'private, no-store')
  async viewer(@Req() request: Request) {
    const [viewer, versions] = await Promise.all([
      this.auth.viewer(request), database.$queryRaw<{ version: string }[]>`SELECT VERSION() AS version`,
    ]);
    return { viewer, databaseVersion: versions[0]?.version ?? '' };
  }
}
