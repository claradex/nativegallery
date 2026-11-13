import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, NotFoundException, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

type GalleryInput = { title?: unknown; opened?: unknown };

function galleryInput(form: GalleryInput) {
  const title = typeof form?.title === 'string' ? form.title.trim() : '';
  if (!title || title.length > 255 || (form.opened !== undefined && form.opened !== '1')) {
    throw new BadRequestException();
  }
  return { title, opened: form.opened === '1' ? 1 : 0 };
}

@Controller('api/admin/galleries')
@Header('Cache-Control', 'private, no-store')
export class AdminGalleriesController {
  constructor(private readonly auth: AuthService) {}

  private async requireAdmin(request: Request) {
    if ((await this.auth.viewer(request))?.admin !== 1) throw new ForbiddenException();
  }

  @Get()
  async list(@Req() request: Request) {
    await this.requireAdmin(request);
    return database.gallery.findMany({ orderBy: { id: 'asc' } });
  }

  @Post()
  async create(@Req() request: Request, @Body() form: GalleryInput, @Res() response: Response) {
    await this.requireAdmin(request);
    await database.gallery.create({ data: galleryInput(form) });
    response.redirect(303, '/admin?type=Galleries');
  }

  @Post(':id')
  async update(@Req() request: Request, @Param('id') rawId: string,
    @Body() form: GalleryInput, @Res() response: Response) {
    await this.requireAdmin(request);
    const id = Number(rawId);
    if (!/^\d{1,10}$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const result = await database.gallery.updateMany({ where: { id }, data: galleryInput(form) });
    if (!result.count) throw new NotFoundException();
    response.redirect(303, '/admin?type=Galleries');
  }
}
