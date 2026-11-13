import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { realpath, stat } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { database } from '@nativegallery/database';
import { enqueue } from '@nativegallery/jobs';

@Controller('api/photo')
export class PhotoThumbnailController {
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
