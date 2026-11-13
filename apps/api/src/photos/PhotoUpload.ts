import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { database } from '@nativegallery/database';
import { photoContent } from './PhotoContent';

const formats = new Map([['jpeg', 'jpg'], ['png', 'png'], ['gif', 'gif'], ['webp', 'webp']]);
const rejected = (errorcode: string) => ({ errorcode, error: 1 });

function photoDate(body: Record<string, unknown>) {
  const year = Number(body.year);
  const month = Number(body.month);
  const day = Number(body.day);
  if (![year, month, day].every(Number.isInteger) || (year !== 0 && year < 1850) || year > 2037 || month < 0 || month > 12 || day < 0 || day > 31) return null;
  const midnight = new Date(Date.UTC(year || 2000, month - 1, day));
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: process.env.SITE_TIMEZONE ?? 'Europe/Moscow', timeZoneName: 'longOffset',
  }).formatToParts(midnight).map(part => [part.type, part.value]));
  const offset = /^GMT([+-])(\d{2}):(\d{2})$/.exec(parts.timeZoneName);
  const minutes = offset ? (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === '-' ? -1 : 1) : 0;
  const timestamp = midnight.getTime() / 1000 - minutes * 60;
  return timestamp >= -2147483648 ? timestamp : null;
}

export async function uploadPhoto(userId: number, body: Record<string, unknown>, buffer?: Buffer) {
  if (!buffer) return rejected('FILE_NOTSELECTED');
  const image = sharp(buffer, { limitInputPixels: 40000000, animated: true });
  const metadata = await image.metadata().catch(() => null);
  const extension = metadata && formats.get(metadata.format);
  if (!extension || (extension === 'gif' && process.env.PHOTO_ALLOW_GIF === 'false')) return rejected('FILE_NOTSUPPORTED');
  if (!await image.stats().catch(() => null)) return rejected('FILE_NOTSUPPORTED');

  const date = photoDate(body);
  const place = typeof body.place === 'string' ? body.place : '';
  const description = typeof body.descr === 'string' ? body.descr : '';
  const gallery = Number(body.gallery || 0);
  const entity = Number(body.nid || 0);
  if (date === null || place.length > 255 || ![gallery, entity].every(id => Number.isInteger(id) && id >= 0 && id <= 2147483647)) {
    return rejected('INVALID_FIELDS');
  }
  const text = (value: unknown) => typeof value === 'string' ? value : null;
  const linkedValue = (key: string) => {
    const values = body[key];
    return text(body[key + '[' + entity + ']'] ?? (values && typeof values === 'object' ? Reflect.get(values, String(entity)) : null));
  };
  const allowed = (key: string) => body[key] === '1' ? 'disabled' : 'allowed';
  const filename = randomBytes(32).toString('hex') + '.' + extension;
  const directory = join(process.env.MEDIA_ROOT ?? '../../uploads', 'cdn', 'img');
  const path = join(directory, filename);
  const photourl = '/uploads/cdn/img/' + filename;
  await mkdir(directory, { recursive: true });
  await writeFile(path, buffer, { flag: 'wx' });

  try {
    const result = await database.$transaction(async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { admin: true, content: true } });
      const targetGallery = gallery && await tx.gallery.findUnique({ where: { id: gallery }, select: { opened: true } });
      if ((gallery && (!targetGallery || !targetGallery.opened)) || (entity && !await tx.entityData.findUnique({ where: { id: entity }, select: { id: true } }))) return null;
      const moderated = process.env.PHOTO_PREMODERATION !== 'false' && user.admin <= 0 && photoContent(user.content).premoderation !== 'true' ? 0 : 1;
      const photo = await tx.photo.create({ data: {
        user_id: userId, postbody: description, photourl, posted_at: date, timeupload: Math.floor(Date.now() / 1000),
        exif: '{"type":"none"}', priority: 0, moderated, place, gallery_id: gallery, entitydata_id: entity,
        content: JSON.stringify({
          type: 'image', videourl: null, copyright: text(body.license), comment: description,
          lat: body.nomap ? null : text(body.lat), lng: body.nomap ? null : text(body.lng),
          comments: allowed('disablecomments'), rating: allowed('disablerating'), showtop: allowed('disableshowtop'),
          entityroute: entity ? linkedValue('route') : null, entitycomment: entity ? linkedValue('notes') : null,
        }),
      }, select: { id: true } });
      if (moderated === 1 && allowed('disablesubsnotify') === 'allowed') {
        const followers = await tx.follower.findMany({ where: { user_id: userId }, distinct: ['follower_id'], select: { follower_id: true } });
        if (followers.length) await tx.followerNotification.createMany({
          data: followers.map(({ follower_id }) => ({ user_id: userId, follower_id, photo_id: photo.id, checked: 0 })),
        });
      }
      return photo;
    });
    if (result) return { id: result.id, errorcode: 0, error: 0 };
  } catch (error) {
    await unlink(path).catch(() => undefined);
    throw error;
  }
  await unlink(path);
  return rejected('INVALID_FIELDS');
}
