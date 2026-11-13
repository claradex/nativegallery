import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { videoContainer } from '../photos/VideoContainer';

export async function storeCommentAttachment(buffer: Buffer) {
  const root = process.env.MEDIA_ROOT ?? '../../uploads';
  const key = randomBytes(32).toString('hex');
  const format = videoContainer(buffer);
  if (format) {
    const input = '.incoming/' + key + '.bin';
    const output = 'cdn/video/' + key + '.mp4';
    const preview = 'cdn/img/' + key + '.jpg';
    await Promise.all(['.incoming', 'cdn/video', 'cdn/img'].map(folder => mkdir(join(root, folder), { recursive: true })));
    const path = join(root, input);
    await writeFile(path, buffer, { flag: 'wx' });
    return { path, url: '/uploads/' + output, type: 'video', job: { input, output, preview, format } };
  }
  const image = sharp(buffer, { limitInputPixels: 16_000_000 });
  const metadata = await image.metadata().catch(() => null);
  if (!metadata || !['jpeg', 'png', 'gif', 'webp'].includes(metadata.format)) return null;
  const jpeg = await image.rotate().jpeg({ quality: 60 }).toBuffer().catch(() => null);
  if (!jpeg) return null;
  const output = 'cdn/img/' + key + '.jpg';
  await mkdir(join(root, 'cdn/img'), { recursive: true });
  const path = join(root, output);
  await writeFile(path, jpeg, { flag: 'wx' });
  return { path, url: '/uploads/' + output, type: 'img' };
}
