import { Body, Controller, ForbiddenException, Get, Header, Post, Req, Res, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { newsHtml } from '../news/NewsHtml';

@Controller('api/admin/pages')
@Header('Cache-Control', 'private, no-store')
export class AdminPagesController {
  constructor(private readonly auth: AuthService) {}

  private async administrator(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (viewer?.admin !== 1) throw new ForbiddenException();
    return viewer;
  }

  @Get()
  async list(@Req() request: Request) {
    await this.administrator(request);
    return database.page.findMany({
      orderBy: { id: 'asc' }, select: { id: true, title: true, created_at: true },
    });
  }

  @Post()
  async create(@Req() request: Request, @Body() form: { title?: unknown; bodypost?: unknown }, @Res() response: Response) {
    const viewer = await this.administrator(request);
    if (typeof form?.title !== 'string' || typeof form?.bodypost !== 'string') throw new BadRequestException();
    const title = form.title.trim();
    const body = newsHtml(form.bodypost).trim();
    if (!title || title.length > 255 || !body || Buffer.byteLength(body) > 65535) throw new BadRequestException();
    await database.page.create({
      data: { title, body, created_by: viewer.id, created_at: Math.floor(Date.now() / 1000) },
    });
    response.redirect(303, '/admin?type=Pages');
  }
}
