import { Body, Controller, Get, Header, HttpCode, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import type { UploadOptionsData } from '@nativegallery/contracts';
import { photoContent } from './PhotoContent';
import { uploadPhoto } from './PhotoUpload';

@Controller('api/upload')
export class PhotoUploadController {
  constructor(private readonly auth: AuthService) {}

  @Get('options')
  @Header('Cache-Control', 'private, no-store')
  async options(@Req() request: Request): Promise<UploadOptionsData> {
    const viewer = await this.auth.requireViewer(request);
    const [galleries, entities, user] = await Promise.all([
      database.gallery.findMany({ where: { opened: 1 }, orderBy: { id: 'asc' }, select: { id: true, title: true } }),
      database.entity.findMany({ orderBy: { id: 'asc' }, select: { id: true, title: true, color: true } }),
      database.user.findUniqueOrThrow({ where: { id: viewer.id }, select: { uploadindex: true, content: true } }),
    ]);
    return { galleries, entities, username: viewer.username, uploadIndex: user.uploadindex,
      directUpload: process.env.PHOTO_PREMODERATION !== 'false' && photoContent(user.content).premoderation === 'true' };
  }

  @Get('entities')
  @Header('Cache-Control', 'private, no-store')
  async entities(@Req() request: Request, @Query('type') type: string, @Query('q') query: string) {
    await this.auth.requireViewer(request);
    const entityid = Number(type);
    if (!Number.isInteger(entityid) || entityid < 1 || entityid > 2147483647 || typeof query !== 'string' || !query.trim() || query.length > 50) return [];
    const id = Number(query);
    return database.entityData.findMany({
      where: { entityid, OR: [{ title: { contains: query } }, ...(Number.isInteger(id) && id > 0 && id <= 2147483647 ? [{ id }] : [])] },
      orderBy: { id: 'asc' }, take: 30, select: { id: true, title: true },
    });
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 32 * 1024 * 1024, fields: 128, fieldSize: 65535 } }))
  async upload(@Req() request: Request, @Body() body: Record<string, unknown>, @UploadedFile() file?: { buffer: Buffer }) {
    const viewer = await this.auth.requireViewer(request);
    return uploadPhoto(viewer.id, body ?? {}, file?.buffer);
  }
}
