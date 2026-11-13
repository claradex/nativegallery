import { Body, Controller, ForbiddenException, Header, HttpCode, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { failure, idOf, metadata } from './CommentMetadata';

@Controller('api/photo/comment')
export class CommentManagementController {
  constructor(private readonly auth: AuthService) {}

  private async viewer(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return viewer;
  }

  @Post(':id/edit')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async edit(@Req() request: Request, @Param('id') id: string, @Body('value') value: unknown) {
    if (typeof value !== 'string' || Buffer.byteLength(value) > 65535) return failure;
    return this.change(request, id, value);
  }

  @Post(':id/delete')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async remove(@Req() request: Request, @Param('id') id: string) {
    return this.change(request, id);
  }

  private async change(request: Request, rawId: string, body?: string) {
    const viewer = await this.viewer(request);
    const id = idOf(rawId);
    return database.$transaction(async tx => {
      const [comment] = await tx.$queryRaw<{ content: string; body: string }[]>(Prisma.sql`
        SELECT content, body FROM photos_comments WHERE id = ${id} AND user_id = ${viewer.id} FOR UPDATE`);
      if (!comment) return failure;
      const content = metadata(comment.content);
      if (body === undefined) content.deleted = 'true';
      else if (body !== comment.body) content.edited = 'true';
      await tx.photoComment.update({ where: { id }, data: { body, content: JSON.stringify(content) } });
      return JSON.stringify({ errorcode: '0', error: 0, postid: rawId });
    });
  }

  @Post(':id/pin')
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async pin(@Req() request: Request, @Param('id') rawId: string) {
    const viewer = await this.viewer(request);
    const id = idOf(rawId);
    return database.$transaction(async tx => {
      const [photo] = await tx.$queryRaw<{ id: number; pinnedcomment_id: number }[]>(Prisma.sql`
        SELECT p.id, p.pinnedcomment_id FROM photos p
        JOIN photos_comments c ON c.photo_id = p.id WHERE c.id = ${id} AND p.user_id = ${viewer.id} FOR UPDATE`);
      if (!photo) return '';
      const pin = photo.pinnedcomment_id !== id;
      await tx.photo.update({ where: { id: photo.id }, data: { pinnedcomment_id: pin ? id : 0 } });
      return JSON.stringify({ errorcode: '0', error: 0, action: pin ? 'pin' : 'unpin' });
    });
  }
}
