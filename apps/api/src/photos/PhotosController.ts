import { Controller, Get, NotFoundException, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { realpath, stat } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { database } from '@nativegallery/database';
import { enqueue } from '@nativegallery/jobs';
import { legacyDate } from '@nativegallery/contracts';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char
));

@Controller('api/photo')
export class PhotosController {
  @Get('loadrecent')
  async recent(@Query('lastpid') lastpid: string, @Req() request: Request) {
    const limit = Number(lastpid);
    if (!Number.isSafeInteger(limit) || limit <= 0) return [];
    const photos = await database.photo.findMany({
      where: { moderated: 1, id: { lt: Math.min(limit, 2147483647) } },
      orderBy: { id: 'desc' }, take: 30,
    });
    const [users, comments] = await Promise.all([
      database.user.findMany({
        where: { id: { in: [...new Set(photos.map(photo => photo.user_id))] } },
        select: { id: true, username: true },
      }),
      database.photoComment.groupBy({
        by: ['photo_id'], where: { photo_id: { in: photos.map(photo => photo.id) } }, _count: { photo_id: true },
      }),
    ]);
    const names = new Map(users.map(user => [user.id, user.username]));
    const counts = new Map(comments.map(row => [row.photo_id, row._count.photo_id]));
    const origin = process.env.SITE_ORIGIN ?? request.protocol + '://' + request.get('host');
    return photos.map(photo => {
      const date = legacyDate(photo.posted_at);
      const thumbnail = origin + '/api/photo/compress?url=' + encodeURIComponent(photo.photourl);
      return {
        id: photo.id, place: escapeHtml(photo.place),
        date: photo.posted_at === 943909200 || date === '30 ноября 1999 в 00:00' ? 'дата не указана' : date,
        user_name: names.get(photo.user_id) ?? 'Unknown', user_id: photo.user_id, photourl: photo.photourl,
        photourl_small: thumbnail, photourl_extrasmall: thumbnail, ccnt: counts.get(photo.id) ?? 0,
      };
    });
  }

  @Get('compress')
  async compress(@Query('url') url: string, @Res() response: Response) {
    if (typeof url !== 'string' || !url.startsWith('/uploads/')) throw new NotFoundException();
    const photo = await database.photo.findFirst({ where: { photourl: url, moderated: 1 }, select: { id: true } });
    if (!photo) throw new NotFoundException();
    const input = url.slice('/uploads/'.length);
    const root = await realpath(process.env.MEDIA_ROOT ?? '../../uploads').catch(() => null);
    if (!root) throw new NotFoundException();
    const source = await realpath(resolve(root, input)).catch(() => null);
    if (!source) throw new NotFoundException();
    const part = relative(root, source);
    if (!part || part === '..' || part.startsWith('..' + sep) || isAbsolute(part) ||
        !await stat(source).then(value => value.isFile()).catch(() => false)) throw new NotFoundException();
    const output = resolve(dirname(source), '.' + basename(source) + '.thumb.jpg');
    if (await stat(output).then(value => value.isFile()).catch(() => false)) {
      response.sendFile(output);
      return;
    }
    await enqueue('CompressImage', 'compress:' + photo.id + ':' + part, { input: part, output: relative(root, output) });
    response.setHeader('Cache-Control', 'no-store');
    response.sendFile(source);
  }
}
