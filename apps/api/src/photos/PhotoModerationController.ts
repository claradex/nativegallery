import { All, BadRequestException, Body, Controller, Get, Header, NotFoundException, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { notifyPhotoFollowers, database, Prisma } from '@nativegallery/database';
import { queuePublication } from '@nativegallery/jobs';
import { AuthService } from '../auth/AuthService';
import { photoContent } from './PhotoContent';

@Controller('api/admin/images')
export class PhotoModerationController {
  constructor(private readonly auth: AuthService) {}

  @Get('pending')
  @Header('Cache-Control', 'private, no-store')
  async pending(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'moderator');
    const photos = await database.photo.findMany({
      where: { moderated: 0 }, orderBy: { id: 'desc' },
      select: { id: true, photourl: true, place: true, postbody: true, user_id: true, posted_at: true, timeupload: true, gallery_id: true },
    });
    return withAuthors(photos);
  }

  /** Every photo with the given moderation status, newest first, for re-moderating published or declined photos. */
  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request, @Query('status') rawStatus: unknown, @Query('page') rawPage: unknown,
    @Query('q') rawQuery: unknown) {
    await this.auth.requireAdmin(request, 'moderator');
    const status = rawStatus === '0' || rawStatus === '2' ? Number(rawStatus) : 1;
    const page = typeof rawPage === 'string' && /^\d{1,5}$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1;
    const query = typeof rawQuery === 'string' ? rawQuery.trim().slice(0, 100) : '';
    const id = /^\d{1,10}$/.test(query) && Number(query) <= 2147483647 ? Number(query) : 0;
    const where: Prisma.PhotoWhereInput = {
      moderated: status,
      ...(query ? { OR: [...(id ? [{ id }] : []), { place: { contains: query } }, { postbody: { contains: query } }] } : {}),
    };
    const size = 24;
    const [total, photos] = await Promise.all([
      database.photo.count({ where }),
      database.photo.findMany({
        where, orderBy: { id: 'desc' }, skip: (page - 1) * size, take: size,
        select: { id: true, photourl: true, place: true, postbody: true, user_id: true, posted_at: true, timeupload: true, gallery_id: true },
      }),
    ]);
    return { total, page, pages: Math.max(1, Math.ceil(total / size)), photos: await withAuthors(photos) };
  }

  @All('setvisibility')
  async setVisibility(@Req() request: Request, @Res() response: Response,
    @Query() query: Record<string, unknown>, @Body('comment') comment: unknown) {
    await this.auth.requireAdmin(request, 'moderator');
    const { id: rawId, mod, reason, irate, krate } = query;
    const id = typeof rawId === 'string' && /^\d{1,10}$/.test(rawId) ? Number(rawId) : 0;
    if (!id || id > 2147483647 || (mod !== '0' && mod !== '1' && mod !== '2')) throw new BadRequestException();
    if (reason !== undefined && (typeof reason !== 'string' || !/^\d{1,3}$/.test(reason))) throw new BadRequestException();
    for (const rate of [irate, krate]) {
      if (rate !== undefined && (typeof rate !== 'string' || rate.length > 20)) throw new BadRequestException();
    }
    if (comment !== undefined && (typeof comment !== 'string' || Buffer.byteLength(comment) > 8192)) {
      throw new BadRequestException();
    }

    await database.$transaction(async tx => {
      const [photo] = await tx.$queryRaw<{ user_id: number; moderated: number; content: string }[]>(Prisma.sql`
        SELECT user_id, moderated, content FROM photos WHERE id = ${id} FOR UPDATE
      `);
      if (!photo) throw new NotFoundException();
      if (photo.moderated === -1) throw new BadRequestException();
      const data = photoContent(photo.content);
      if (!Object.hasOwn(data, 'iRate')) data.iRate = irate ?? null;
      if (!Object.hasOwn(data, 'kRate')) data.kRate = krate ?? null;
      if (!Object.hasOwn(data, 'declineReason') || mod !== '1') data.declineReason = mod !== '1' ? reason ?? null : null;
      if (comment) data.declineComment = comment;
      const content = JSON.stringify(data);
      if (Buffer.byteLength(content) > 65535) throw new BadRequestException();
      const firstPublication = mod === '1' && photo.moderated !== 1;
      const nextStatus = Number(mod);
      const now = Math.floor(Date.now() / 1000);
      await tx.photo.update({ where: { id }, data: {
        moderated: nextStatus, priority: mod === '1' ? Number(reason ?? 0) : 0,
        timeupload: photo.moderated !== nextStatus ? now : undefined,
        endmoderation: nextStatus === 0 ? -1 : photo.moderated === 0 ? now : undefined,
        content,
      } });
      // Storages that take only approved photos get it now; the rest had it queued on upload.
      if (firstPublication) await queuePublication(tx, id, true);
      if (!firstPublication || data.subsnotify === 'disabled') return;
      await notifyPhotoFollowers(tx, id, photo.user_id);
    });
    response.setHeader('Cache-Control', 'private, no-store');
    return response.redirect(303, '/admin?type=Photo');
  }
}

async function withAuthors<T extends { user_id: number }>(photos: T[]) {
  const users = await database.user.findMany({
    where: { id: { in: [...new Set(photos.map(photo => photo.user_id))] } }, select: { id: true, username: true },
  });
  const names = new Map(users.map(user => [user.id, user.username]));
  return photos.map(photo => ({ ...photo, username: names.get(photo.user_id) ?? '' }));
}
