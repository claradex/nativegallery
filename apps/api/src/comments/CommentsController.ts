import { Body, Controller, ForbiddenException, Get, Header, HttpCode, Param, Post, Query, Req, UseInterceptors } from '@nestjs/common';
import { NoFilesInterceptor } from "@nestjs/platform-express";
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function idOf(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 0;
  const id = Number(value);
  return id <= 2147483647 ? id : 0;
}

function metadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
}

const failure = '{"errorcode":"1","error":1}';

@Controller('api/photo/comment')
export class CommentsController {
  constructor(private readonly auth: AuthService) {}

  private async viewer(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return viewer;
  }

  @Post()
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @UseInterceptors(NoFilesInterceptor({ limits: { fields: 12, fieldSize: 65535, parts: 12 } }))
  async create(@Req() request: Request, @Body() body: { id?: unknown; wtext?: unknown }) {
    const viewer = await this.viewer(request);
    const id = idOf(body?.id);
    const message = body?.wtext;
    if (!id) return '{"errorcode":"3","error":1}';
    if (typeof message !== 'string' || !message.trim()) return failure;
    if (Buffer.byteLength(message) > 65535) return '{"errorcode":"2","error":1}';

    return database.$transaction(async tx => {
      const [photo] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT id FROM photos WHERE id = ${id}
          AND (moderated = 1 OR user_id = ${viewer.id} OR ${viewer.admin} > 0)
        FOR UPDATE`);
      if (!photo) return '{"errorcode":"3","error":1}';
      await tx.photoComment.create({
        data: {
          user_id: viewer.id,
          photo_id: id,
          body: message,
          posted_at: Math.floor(Date.now() / 1000),
          content: JSON.stringify({ type: 'none', by: 'user', filetype: null, src: null }),
        },
      });
      return '{"errorcode":"0","error":0}';
    });
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

  @Get('rate')
  @Header('Cache-Control', 'private, no-store')
  async rate(@Req() request: Request, @Query('wid') rawId: unknown, @Query('vote') vote: unknown) {
    const viewer = await this.viewer(request);
    const id = idOf(rawId);
    if (!id || (vote !== '0' && vote !== '1')) return '';
    const type = Number(vote);
    return database.$transaction(async tx => {
      const [comment] = await tx.$queryRaw<{ id: number; content: string }[]>(Prisma.sql`
        SELECT c.id, c.content FROM photos_comments c JOIN photos p ON p.id = c.photo_id
        WHERE c.id = ${id} AND (p.moderated = 1 OR p.user_id = ${viewer.id} OR ${viewer.admin} > 0) FOR UPDATE`);
      if (!comment || metadata(comment.content).deleted === 'true') return '';
      const where = { user_id: viewer.id, comment_id: id };
      const previous = await tx.photoCommentRate.findFirst({ where, orderBy: { id: 'asc' } });
      const selected = previous?.type === type ? null : type;
      await tx.photoCommentRate.deleteMany({ where });
      if (selected !== null) await tx.photoCommentRate.create({ data: { ...where, type: selected } });
      const counts = await tx.photoCommentRate.groupBy({ by: ['type'], where: { comment_id: id }, _count: { type: true } });
      const positive = counts.find(count => count.type === 1)?._count.type ?? 0;
      const negative = counts.find(count => count.type === 0)?._count.type ?? 0;
      return [{ 1: selected === 1, 0: selected === 0 }, { 1: positive, 0: -negative || 0 }, positive - negative];
    });
  }
}
