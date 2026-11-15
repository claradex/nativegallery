import { Controller, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { setting } from '@nativegallery/config';

@Controller('api')
export class HealthController {
  @Get('health')
  health() { return { status: 'ok' }; }

  /** Served at /robots.txt through the frontend rewrite, so the public host arrives as X-Forwarded-Host. */
  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots(@Req() request: Request) {
    const forwarded = request.get('x-forwarded-host')?.split(',')[0]?.trim();
    const hostname = setting('SITE_ORIGIN') ? new URL(setting('SITE_ORIGIN')).hostname
      : new URL('http://' + (forwarded || request.get('host') || 'localhost')).hostname;
    return 'User-Agent: *\nDisallow: /lk/\nClean-Param: vid&gid&upd /photo/\nHost: https://' + hostname;
  }
}
