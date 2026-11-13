import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { realpath, rename, rm } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import { Injectable, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import type { JobKind } from '@nativegallery/contracts';
import { consume, enabled } from '@nativegallery/jobs';

import { renderUploadedVideo } from './RenderUploadedVideo';

const ffmpeg = promisify(execFile);
const formats = {
  BlurNewImage: ['-vf', 'scale=32:-1,gblur=sigma=3', '-frames:v', '1'],
  CompressImage: ['-q:v', '4', '-frames:v', '1'],
  RenderVideo: ['-c:v', 'libx264', '-crf', '23', '-c:a', 'aac'],
};

function inside(root: string, file: string) {
  const path = resolve(root, file);
  const part = relative(root, path);
  if (!part || part === '..' || part.startsWith('..' + sep) || isAbsolute(part)) {
    throw new Error('Path must be inside MEDIA_ROOT');
  }
  return path;
}

@Injectable()
class MediaWorker implements OnModuleInit, OnApplicationShutdown {
  private timer?: NodeJS.Timeout;
  private active?: Promise<void>;

  onModuleInit() {
    this.timer = setInterval(() => {
      if (this.active) return;
      this.active = this.poll().catch(console.error).finally(() => { this.active = undefined; });
    }, 1000);
  }

  async onApplicationShutdown() {
    clearInterval(this.timer);
    await this.active;
  }

  private async poll() {
    const kinds: JobKind[] = [];
    for (const kind of Object.keys(formats) as (keyof typeof formats)[]) {
      if (await enabled(kind)) kinds.push(kind);
    }
    if (!kinds.length) return;
    await consume(kinds, async (kind, payload) => {
      if (kind === 'ExecContests' || !payload || typeof payload !== 'object' || Array.isArray(payload) ||
          typeof payload.input !== 'string' || typeof payload.output !== 'string') {
        throw new Error('Invalid media job');
      }
      const root = await realpath(process.env.MEDIA_ROOT ?? '../../uploads');
      const inputPath = inside(root, payload.input);
      const input = inside(root, await realpath(inputPath));
      const requested = inside(root, payload.output);
      const directory = await realpath(dirname(requested));
      const output = inside(root, resolve(directory, basename(requested)));
      if (input === output) throw new Error('Input and output must differ');
      if (kind === 'RenderVideo' && typeof payload.preview === 'string' && typeof payload.format === 'string') {
        const preview = inside(root, payload.preview);
        const previewDirectory = await realpath(dirname(preview));
        await renderUploadedVideo(input, payload.format, output, inside(root, resolve(previewDirectory, basename(preview))));
        return;
      }
      const temporary = resolve(directory, '.' + randomUUID() + extname(output));
      try {
        await ffmpeg(process.env.FFMPEG_PATH ?? 'ffmpeg', ['-nostdin', '-y', '-i', input, ...formats[kind], temporary],
          { timeout: 600_000, maxBuffer: 4 * 1024 * 1024 });
        await rename(temporary, output);
      } finally {
        await rm(temporary, { force: true });
      }
    });
  }
}

@Module({ providers: [MediaWorker] })
export class MediaModule {}
