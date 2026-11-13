import { BadRequestException, Body, Controller, Get, Header, NotFoundException, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { requireId } from '../common/ids';

type GalleryInput = { title?: unknown; opened?: unknown };

function galleryInput(form: GalleryInput) {
  const title = typeof form?.title === 'string' ? form.title.trim() : '';
  if (!title || title.length > 255 || (form.opened !== undefined && form.opened !== '1')) {
    throw new BadRequestException();
  }
  return { title, opened: form.opened === '1' ? 1 : 0 };
}

@Controller('api/admin/galleries')
export class AdminGalleriesController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'owner');
    return database.gallery.findMany({ orderBy: { id: 'asc' } });
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  async create(@Req() request: Request, @Body() form: GalleryInput, @Res() response: Response) {
    await this.auth.requireAdmin(request, 'owner');
    await database.gallery.create({ data: galleryInput(form) });
    response.redirect(303, '/admin?type=Galleries');
  }

  @Post(':id')
  @Header('Cache-Control', 'private, no-store')
  async update(@Req() request: Request, @Param('id') rawId: string,
    @Body() form: GalleryInput, @Res() response: Response) {
    await this.auth.requireAdmin(request, 'owner');
    const id = requireId(rawId);
    const result = await database.gallery.updateMany({ where: { id }, data: galleryInput(form) });
    if (!result.count) throw new NotFoundException();
    response.redirect(303, '/admin?type=Galleries');
  }
}
