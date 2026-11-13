import { All, BadRequestException, Body, Controller, ForbiddenException, Get, Header, NotFoundException, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { photoContent } from './PhotoContent';

@Controller('api/admin/images')
export class PhotoModerationController {
  constructor(private readonly auth: AuthService) {}

  @Get('pending')
  @Header('Cache-Control', 'private, no-store')
  async pending(@Req() request: Request) {
    if (!(await this.auth.viewer(request))?.admin) throw new ForbiddenException();
    return database.photo.findMany({
      where: { moderated: 0 }, orderBy: { id: 'desc' },
      select: { id: true, photourl: true, place: true, postbody: true, user_id: true },
    });
  }

  @All('setvisibility')
  async setVisibility(@Req() request: Request, @Res() response: Response,
    @Query() query: Record<string, unknown>, @Body('comment') comment: unknown) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin) throw new ForbiddenException();
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
      const data = photoContent(photo.content);
      if (!Object.hasOwn(data, 'iRate')) data.iRate = irate ?? null;
      if (!Object.hasOwn(data, 'kRate')) data.kRate = krate ?? null;
      if (!Object.hasOwn(data, 'declineReason') || mod !== '1') data.declineReason = mod !== '1' ? reason ?? null : null;
      if (comment) data.declineComment = comment;
      const content = JSON.stringify(data);
      if (Buffer.byteLength(content) > 65535) throw new BadRequestException();
      const firstPublication = mod === '1' && photo.moderated !== 1;
      await tx.photo.update({ where: { id }, data: {
        moderated: Number(mod), priority: mod === '1' ? Number(reason ?? 0) : 0,
        timeupload: photo.moderated !== Number(mod) ? Math.floor(Date.now() / 1000) : undefined, content,
      } });
      if (!firstPublication) return;
      const [followers, notified] = await Promise.all([
        tx.follower.findMany({ where: { user_id: photo.user_id }, select: { follower_id: true } }),
        tx.followerNotification.findMany({ where: { photo_id: id }, select: { follower_id: true } }),
      ]);
      const existing = new Set(notified.map(row => row.follower_id));
      const recipients = [...new Set(followers.map(row => row.follower_id))].filter(follower => !existing.has(follower));
      if (recipients.length) await tx.followerNotification.createMany({
        data: recipients.map(follower_id => ({ follower_id, user_id: photo.user_id, photo_id: id, checked: 0 })),
      });
    });
    response.setHeader('Cache-Control', 'private, no-store');
    return response.redirect(303, '/admin?type=Photo');
  }
}
