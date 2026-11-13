import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { rename, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const ffmpeg = promisify(execFile);

export async function renderUploadedVideo(input: string, format: string, video: string, poster: string) {
  if (!['mov', 'avi', 'matroska'].includes(format)) throw new Error('Unsupported video container');
  const ready = (path: string) => stat(path).then(file => file.isFile() && file.size > 0).catch(() => false);
  if (await ready(video) && await ready(poster)) return;

  const token = randomUUID();
  const temporaryVideo = join(dirname(video), '.' + token + '.mp4');
  const temporaryPoster = join(dirname(poster), '.' + token + '.jpg');
  const run = (args: string[]) => ffmpeg(process.env.FFMPEG_PATH ?? 'ffmpeg',
    ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', ...args], { timeout: 600_000, maxBuffer: 1024 * 1024 });
  try {
    await run(['-protocol_whitelist', 'file', ...(format === 'mov' ? ['-enable_drefs', '0'] : []), '-f', format, '-i', input,
      '-map', '0:v:0', '-map', '0:a:0?', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-movflags', '+faststart', temporaryVideo]);
    await run(['-i', temporaryVideo, '-frames:v', '1', '-q:v', '2', temporaryPoster]);
    if (!await ready(temporaryVideo) || !await ready(temporaryPoster)) throw new Error('FFmpeg produced an empty output');
    await rename(temporaryVideo, video);
    await rename(temporaryPoster, poster);
  } finally {
    await Promise.all([rm(temporaryVideo, { force: true }), rm(temporaryPoster, { force: true })]);
  }
}
