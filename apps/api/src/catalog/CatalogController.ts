import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api')
export class CatalogController {
  constructor(private readonly auth: AuthService) {}

  @Get('geodb/search')
  async geodb(@Req() request: Request, @Query('place') place: string) {
    await this.auth.requireViewer(request);
    if (!place || place === '0') return { error: 'No query provided' };
    return (await database.geoEntry.findMany({ where: { title: { contains: place } }, select: { title: true } }))
      .map(entry => entry.title);
  }
}
