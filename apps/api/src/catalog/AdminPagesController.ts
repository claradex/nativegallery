import { Body, Controller, Delete, Get, Header, HttpCode, NotFoundException, Param, Patch, Post, Req, Res, BadRequestException } from '@nestjs/common';
import { requireId } from '../common/ids';
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

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'owner');
    return database.page.findMany({
      orderBy: { id: 'asc' }, select: { id: true, title: true, created_at: true },
    });
  }

  @Post('preview')
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  async preview(@Req() request: Request, @Body() form: PageForm) {
    await this.auth.requireAdmin(request, 'owner');
    const { title, body } = pageInput(form);
    return { title, html: body };
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  async create(@Req() request: Request, @Body() form: PageForm, @Res() response: Response) {
    const viewer = await this.auth.requireAdmin(request, 'owner');
    const { title, body } = pageInput(form);
    await database.page.create({
      data: { title, body, created_by: viewer.id, created_at: Math.floor(Date.now() / 1000) },
    });
    response.redirect(303, '/admin?type=Pages');
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async detail(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'owner');
    const page = await database.page.findUnique({ where: { id: requireId(rawId) } });
    if (!page) throw new NotFoundException();
    return page;
  }

  @Patch(':id')
  @Header('Cache-Control', 'private, no-store')
  async update(@Req() request: Request, @Param('id') rawId: string, @Body() form: PageForm) {
    await this.auth.requireAdmin(request, 'owner');
    const id = requireId(rawId);
    const result = await database.page.updateMany({ where: { id }, data: pageInput(form) });
    if (!result.count) throw new NotFoundException();
    return { id };
  }

  @Delete(':id')
  @Header('Cache-Control', 'private, no-store')
  async remove(@Req() request: Request, @Param('id') rawId: string) {
    await this.auth.requireAdmin(request, 'owner');
    const id = requireId(rawId);
    const result = await database.page.deleteMany({ where: { id } });
    if (!result.count) throw new NotFoundException();
    return { id };
  }
}
