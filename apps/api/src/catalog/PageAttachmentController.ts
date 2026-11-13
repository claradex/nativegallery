import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Body, Controller, ForbiddenException, Header, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import sharp from 'sharp';
import { AuthService } from '../auth/AuthService';

const imageExtensions = new Map([['jpeg', 'jpg'], ['png', 'png'], ['gif', 'gif'], ['webp', 'webp']]);

async function attachmentExtension(kind: unknown, buffer: Buffer) {
  if (kind === 'img') {
    const image = sharp(buffer, { limitInputPixels: 40_000_000 });
    const metadata = await image.metadata().catch(() => null);
    return metadata && imageExtensions.get(metadata.format);
  }
  if (kind === 'video' && buffer.length >= 16 && buffer.toString('ascii', 4, 8) === 'ftyp') return 'mp4';
  if (kind === 'audio' && buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'ID3') return 'mp3';
  return null;
}

@Controller('api/admin/pages/attachments')
@Header('Cache-Control', 'private, no-store')
export class PageAttachmentController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 32 * 1024 * 1024, fields: 1, fieldSize: 16 } }))
  async upload(@Req() request: Request, @Body('kind') kind: unknown, @UploadedFile() file?: { buffer: Buffer }) {
    if ((await this.auth.viewer(request))?.admin !== 1) throw new ForbiddenException();
    if (!file) throw new BadRequestException();
    const extension = await attachmentExtension(kind, file.buffer);
    if (!extension) throw new BadRequestException();
    const directory = join(process.env.MEDIA_ROOT ?? '../../uploads', 'cdn', 'pages');
    const filename = randomBytes(32).toString('hex') + '.' + extension;
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer, { flag: 'wx' });
    return { url: '/uploads/cdn/pages/' + filename };
  }
}
