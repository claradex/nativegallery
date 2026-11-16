import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { notifyPhotoFollowers, database } from '@nativegallery/database';
import { videoContainer } from './VideoContainer';
import { uploadedExif } from './UploadedExif';
import { photoContent } from './PhotoContent';
import { flag, setting } from '@nativegallery/config';
import { queuePublication } from '@nativegallery/jobs';
import { maxPhotoVehicles, vehicleAngles, type UploadVehicleLink } from '@nativegallery/contracts';

const formats = new Map([['jpeg', 'jpg'], ['png', 'png'], ['gif', 'gif'], ['webp', 'webp']]);
const rejected = (errorcode: string) => ({ errorcode, error: 1 });

/**
 * The vehicles on the photo, left to right: the `vehicles` JSON array the upload form sends, or the legacy single
 * `nid` with `route[nid]`/`notes[nid]`. `null` when the value is malformed.
 */
function photoVehicles(body: Record<string, unknown>): UploadVehicleLink[] | null {
  const short = (value: unknown, max: number) => typeof value === 'string' && value.length <= max ? value.trim() : value === undefined || value === null ? '' : null;
  if (typeof body.vehicles === 'string' && body.vehicles.trim()) {
    let list: unknown;
    try { list = JSON.parse(body.vehicles); } catch { return null; }
    if (!Array.isArray(list) || list.length > maxPhotoVehicles) return null;
    const links: UploadVehicleLink[] = [];
    for (const item of list) {
      if (!item || typeof item !== 'object') return null;
      const { id, route, note, angle } = item as Record<string, unknown>;
      const r = short(route, 16), n = short(note, 255);
      if (!Number.isInteger(id) || (id as number) < 1 || (id as number) > 2147483647 || r === null || n === null) return null;
      if (!vehicleAngles.some(item => item.id === (angle ?? 0))) return null;
      if (links.some(link => link.id === id)) continue;
      links.push({ id: id as number, route: r, note: n, angle: (angle as number | undefined) ?? 0 });
    }
    return links;
  }
  const entity = Number(body.nid || 0);
  if (!Number.isInteger(entity) || entity < 0 || entity > 2147483647) return null;
  if (!entity) return [];
  const linked = (key: string) => {
    const values = body[key];
    const value = body[key + '[' + entity + ']'] ?? (values && typeof values === 'object' ? Reflect.get(values, String(entity)) : null);
    return typeof value === 'string' ? value.trim() : '';
  };
  return [{ id: entity, route: linked('route').slice(0, 16), note: linked('notes').slice(0, 255), angle: 0 }];
}

function photoDate(body: Record<string, unknown>) {
  const year = Number(body.year);
  const month = Number(body.month);
  const day = Number(body.day);
  if (![year, month, day].every(Number.isInteger) || (year !== 0 && year < 1850) || year > 2037 || month < 0 || month > 12 || day < 0 || day > 31) return null;
  const midnight = new Date(Date.UTC(year || 2000, month - 1, day));
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: setting('SITE_TIMEZONE'), timeZoneName: 'longOffset',
  }).formatToParts(midnight).map(part => [part.type, part.value]));
  const offset = /^GMT([+-])(\d{2}):(\d{2})$/.exec(parts.timeZoneName);
  const minutes = offset ? (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === '-' ? -1 : 1) : 0;
  const timestamp = midnight.getTime() / 1000 - minutes * 60;
  return timestamp >= -2147483648 ? timestamp : null;
}

export async function uploadPhoto(userId: number, body: Record<string, unknown>, buffer?: Buffer) {
  if (!buffer) return rejected('FILE_NOTSELECTED');
  const video = videoContainer(buffer);
  const image = sharp(buffer, { limitInputPixels: 40000000, animated: true });
  const metadata = video ? null : await image.metadata().catch(() => null);
  const extension = video ? 'jpg' : metadata && formats.get(metadata.format);
  if (!extension || (extension === 'gif' && !flag('PHOTO_ALLOW_GIF'))) return rejected('FILE_NOTSUPPORTED');
  if (!video && !await image.stats().catch(() => null)) return rejected('FILE_NOTSUPPORTED');

  const fields = body.disableexif === '1' ? {} : uploadedExif(metadata?.exif);
  const exif = JSON.stringify(Object.keys(fields).length ? fields : { type: 'none' });
  const date = photoDate(body);
  const place = typeof body.place === 'string' ? body.place : '';
  const description = typeof body.descr === 'string' ? body.descr : '';
  const gallery = Number(body.gallery || 0);
  const vehicles = photoVehicles(body);
  if (date === null || place.length > 255 || !vehicles || !Number.isInteger(gallery) || gallery < 0 || gallery > 2147483647) {
    return rejected('INVALID_FIELDS');
  }
  const entity = vehicles[0]?.id ?? 0;
  const text = (value: unknown) => typeof value === 'string' ? value : null;
  const allowed = (key: string) => body[key] === '1' ? 'disabled' : 'allowed';
  const key = randomBytes(32).toString('hex');
  const root = process.env.MEDIA_ROOT ?? '../../uploads';
  const preview = 'cdn/img/' + key + '.' + extension;
  const output = 'cdn/video/' + key + '.mp4';
  const input = video ? '.incoming/' + key + '.bin' : preview;
  const path = join(root, input);
  await mkdir(join(root, video ? '.incoming' : 'cdn/img'), { recursive: true });
  if (video) await Promise.all(['cdn/img', 'cdn/video'].map(directory => mkdir(join(root, directory), { recursive: true })));
  await writeFile(path, buffer, { flag: 'wx' });

  try {
    const result = await database.$transaction(async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { admin: true, content: true } });
      const targetGallery = gallery && await tx.gallery.findUnique({ where: { id: gallery }, select: { opened: true } });
      if ((gallery && (!targetGallery || !targetGallery.opened)) || 
        (vehicles.length && await tx.entityData.count({ where: { id: { in: vehicles.map(vehicle => vehicle.id) } } }) !== vehicles.length)) return null;
      const moderated = flag('PHOTO_PREMODERATION') && user.admin <= 0 && photoContent(user.content).premoderation !== 'true' ? 0 : 1;
      const photo = await tx.photo.create({ data: {
        user_id: userId, postbody: description, photourl: '/uploads/' + preview, posted_at: date, timeupload: Math.floor(Date.now() / 1000),
        exif, priority: 0, moderated: video ? -1 : moderated, endmoderation: moderated === 0 ? -1 : 0, place, gallery_id: gallery, entitydata_id: entity,
        content: JSON.stringify({
          type: video ? 'video' : 'image', videourl: video ? '/uploads/' + output : null, copyright: text(body.license), comment: description,
          lat: body.nomap ? null : text(body.lat), lng: body.nomap ? null : text(body.lng),
          comments: allowed('disablecomments'), rating: allowed('disablerating'), showtop: allowed('disableshowtop'), subsnotify: allowed('disablesubsnotify'),
          entityroute: vehicles[0]?.route || null, entitycomment: vehicles[0]?.note || null,
        }),
      }, select: { id: true } });
      if (vehicles.length) await tx.photoVehicle.createMany({ data: vehicles.map((vehicle, position) => ({
        photo_id: photo.id, entitydata_id: vehicle.id, position, route: vehicle.route || null, note: vehicle.note || null, angle: vehicle.angle,
      })) });
      if (video) await tx.job.create({ data: {
        kind: 'RenderVideo', dedupe_key: 'render-video:' + photo.id,
        payload: { input, output, preview, format: video, photoId: photo.id, moderation: moderated }, available_at: new Date(),
      } });
      // A video's files are published by the media worker once they are rendered.
      if (!video) await queuePublication(tx, photo.id, moderated === 1);
      if (!video && moderated === 1 && allowed('disablesubsnotify') === 'allowed') {
        await notifyPhotoFollowers(tx, photo.id, userId);
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
