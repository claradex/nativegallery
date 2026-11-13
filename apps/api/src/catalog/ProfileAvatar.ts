import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export async function storeAvatar(buffer: Buffer) {
  const image = sharp(buffer, { limitInputPixels: 6400000 });
  const metadata = await image.metadata().catch(() => null);
  if (metadata?.format !== 'jpeg' || !metadata.width || metadata.width > 800) return null;
  const filename = randomBytes(32).toString('hex') + '.jpg';
  const directory = join(process.env.MEDIA_ROOT ?? '../../uploads', 'cdn', 'img');
  const path = join(directory, filename);
  const jpeg = await image.rotate().jpeg().toBuffer().catch(() => null);
  if (!jpeg) return null;
  await mkdir(directory, { recursive: true });
  await writeFile(path, jpeg, { flag: 'wx' });
  return { url: '/uploads/cdn/img/' + filename, discard: () => unlink(path) };
}
