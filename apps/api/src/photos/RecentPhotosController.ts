import { Controller, Get, Query } from '@nestjs/common';
import { database } from '@nativegallery/database';
import { legacyDate } from '@nativegallery/contracts';
import { setting } from '@nativegallery/config';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char
));

@Controller('api/photo')
export class RecentPhotosController {
  @Get('loadrecent')
  async recent(@Query('lastpid') lastpid: string) {
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
    // Relative unless an origin is configured: behind the frontend proxy the Host header is the internal API address.
    const origin = setting('SITE_ORIGIN') || '';
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
}
