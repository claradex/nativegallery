import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { realpath, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

@Controller('uploads/cdn')
export class PublicMediaController {
  @Get('img/:filename')
  async image(@Param('filename') filename: string, @Res() response: Response) {
    if (!/^(?:[a-f0-9]{64}|[a-f0-9]{128})\.(?:jpe?g|png|gif|webp)$/i.test(filename)) throw new NotFoundException();
    return this.send('img', filename, response);
  }

  @Get('video/:filename')
  async video(@Param('filename') filename: string, @Res() response: Response) {
    if (!/^(?:[a-f0-9]{64}|[a-f0-9]{128})\.mp4$/i.test(filename)) throw new NotFoundException();
    return this.send('video', filename, response);
  }

  @Get('pages/:filename')
  async attachment(@Param('filename') filename: string, @Res() response: Response) {
    if (!/^[a-f0-9]{64}\.(?:jpg|png|gif|webp|mp4|mp3)$/.test(filename)) throw new NotFoundException();
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return this.send('pages', filename, response);
  }

  private async send(folder: 'img' | 'video' | 'pages', filename: string, response: Response) {
    const directory = await realpath(join(process.env.MEDIA_ROOT ?? '../../uploads', 'cdn', folder)).catch(() => null);
    if (!directory) throw new NotFoundException();
    const file = await realpath(join(directory, filename)).catch(() => null);
    if (!file || dirname(file) !== directory || !await stat(file).then(entry => entry.isFile()).catch(() => false)) {
      throw new NotFoundException();
    }
    response.sendFile(file, { maxAge: '1y', immutable: true });
  }
}
