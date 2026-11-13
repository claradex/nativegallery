import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, NotFoundException, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { photoContent } from './PhotoContent';

@Controller('api/account/photos')
export class PhotoEditController {
  constructor(private readonly auth: AuthService) {}

  private async ownedPhoto(request: Request, rawId: string) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    const id = Number(rawId);
    if (!/^\d{1,10}$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    return { id, user_id: viewer.id };
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async load(@Req() request: Request, @Param('id') id: string) {
    const owner = await this.ownedPhoto(request, id);
    const photo = await database.photo.findFirst({
      where: { ...owner, moderated: { in: [0, 1, 2] } }, select: { id: true, place: true, postbody: true },
    });
    if (!photo) throw new NotFoundException();
    return photo;
  }

  @Post(':id')
  @Header('Cache-Control', 'private, no-store')
  async save(@Req() request: Request, @Param('id') id: string, @Body() form: { place?: unknown; descr?: unknown }, @Res() response: Response) {
    const owner = await this.ownedPhoto(request, id);
    const { place, descr } = form ?? {};
    if (typeof place !== 'string' || place.length > 255 || typeof descr !== 'string' || Buffer.byteLength(descr) > 65535) {
      throw new BadRequestException();
    }
    await database.$transaction(async tx => {
      const [photo] = await tx.$queryRaw<{ content: string }[]>(Prisma.sql`
        SELECT content FROM photos WHERE id = ${owner.id} AND user_id = ${owner.user_id}
          AND moderated IN (0, 1, 2) FOR UPDATE
      `);
      if (!photo) throw new NotFoundException();
      const content = JSON.stringify({ ...photoContent(photo.content), comment: descr });
      if (Buffer.byteLength(content) > 65535) throw new BadRequestException();
      await tx.photo.update({ where: { id: owner.id }, data: { place, postbody: descr, content } });
    });
    response.redirect(303, '/lk/history');
  }
}
