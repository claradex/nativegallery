import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { realpath, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

@Controller('uploads/cdn/img')
export class ProfileAvatarController {
  @Get(':filename')
  async avatar(@Param('filename') filename: string, @Res() response: Response) {
    if (!/^(?:[a-f0-9]{64}|[a-f0-9]{128})\.jpe?g$/i.test(filename)) throw new NotFoundException();
    const directory = await realpath(join(process.env.MEDIA_ROOT ?? '../../uploads', 'cdn', 'img')).catch(() => null);
    if (!directory) throw new NotFoundException();
    const file = await realpath(join(directory, filename)).catch(() => null);
    if (!file || dirname(file) !== directory || !await stat(file).then(entry => entry.isFile()).catch(() => false)) {
      throw new NotFoundException();
    }
    response.sendFile(file, { maxAge: '1y', immutable: true });
  }
}
