import { Body, Controller, ForbiddenException, Get, Header, HttpCode, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { uploadPhoto } from './PhotoUpload';

@Controller('api/upload')
export class PhotoUploadController {
  constructor(private readonly auth: AuthService) {}

  @Get('options')
  @Header('Cache-Control', 'private, no-store')
  async options(@Req() request: Request) {
    if (!await this.auth.viewer(request)) throw new ForbiddenException();
    return database.gallery.findMany({ where: { opened: 1 }, orderBy: { id: 'asc' }, select: { id: true, title: true } });
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 32 * 1024 * 1024, fields: 128, fieldSize: 65535 } }))
  async upload(@Req() request: Request, @Body() body: Record<string, unknown>, @UploadedFile() file?: { buffer: Buffer }) {
    const viewer = await this.auth.viewer(request);
    if (!viewer) throw new ForbiddenException();
    return uploadPhoto(viewer.id, body ?? {}, file?.buffer);
  }
}
