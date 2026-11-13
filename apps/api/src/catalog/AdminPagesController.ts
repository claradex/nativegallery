import { Body, Controller, ForbiddenException, Get, Header, HttpCode, Post, Req, Res, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { sitePageHtml } from './SitePageHtml';

type PageForm = { title?: unknown; bodypost?: unknown };

function pageInput(form: PageForm) {
  if (typeof form?.title !== 'string' || typeof form?.bodypost !== 'string') throw new BadRequestException();
  const title = form.title.trim();
  if (!title || title.length > 255 || Buffer.byteLength(form.bodypost) > 65535) throw new BadRequestException();
  const body = sitePageHtml(form.bodypost).trim();
  if (!body || Buffer.byteLength(body) > 65535) throw new BadRequestException();
  return { title, body };
}

@Controller('api/admin/pages')
export class AdminPagesController {
  constructor(private readonly auth: AuthService) {}

  private async administrator(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (viewer?.admin !== 1) throw new ForbiddenException();
    return viewer;
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.administrator(request);
    return database.page.findMany({
      orderBy: { id: 'asc' }, select: { id: true, title: true, created_at: true },
    });
  }

  @Post('preview')
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  async preview(@Req() request: Request, @Body() form: PageForm) {
    await this.administrator(request);
    const { title, body } = pageInput(form);
    return { title, html: body };
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  async create(@Req() request: Request, @Body() form: PageForm, @Res() response: Response) {
    const viewer = await this.administrator(request);
    const { title, body } = pageInput(form);
    await database.page.create({
      data: { title, body, created_by: viewer.id, created_at: Math.floor(Date.now() / 1000) },
    });
    response.redirect(303, '/admin?type=Pages');
  }
}
