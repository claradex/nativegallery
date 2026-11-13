import { Body, Controller, ForbiddenException, Header, HttpCode, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { unlink } from 'node:fs/promises';
import { storeCommentAttachment } from './CommentAttachment';
import { AuthService } from '../auth/AuthService';
import { failure, metadata } from './CommentMetadata';
import { parseId } from '../common/ids';

@Controller('api/photo/comment')
export class CommentCreateController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  @HttpCode(200)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @UseInterceptors(FileInterceptor('filebody', { limits: { fields: 12, fieldSize: 65535, parts: 13, fileSize: 32 * 1024 * 1024 } }))
  async create(@Req() request: Request, @Body() body: { id?: unknown; wtext?: unknown }, @UploadedFile() file?: { buffer: Buffer }) {
    const viewer = await this.auth.requireViewer(request);
    if (process.env.EMAIL_VERIFY === 'true' && viewer.status === 3) throw new ForbiddenException();
    const id = parseId(body?.id);
    const message = typeof body?.wtext === 'string' ? body.wtext : '';
    if (!id) return '{"errorcode":"3","error":1}';
    if (!message.trim() && !file) return failure;
    if (Buffer.byteLength(message) > 65535) return '{"errorcode":"2","error":1}';

    const attachment = file ? await storeCommentAttachment(file.buffer) : null;
    if (file && !attachment) return failure;
    let saved = false;
    try {
      const result = await database.$transaction(async tx => {
        const [photo] = await tx.$queryRaw<{ id: number; user_id: number; content: string }[]>(Prisma.sql`
          SELECT id, user_id, content FROM photos WHERE id = ${id}
            AND (moderated = 1 OR user_id = ${viewer.id} OR ${viewer.admin} > 0)
          FOR UPDATE`);
        if (!photo) return '{"errorcode":"3","error":1}';
        if (metadata(photo.content).comments === 'disabled' && photo.user_id !== viewer.id) return failure;
        const comment = await tx.photoComment.create({
          data: {
            user_id: viewer.id,
            photo_id: id,
            body: message,
            posted_at: Math.floor(Date.now() / 1000),
            content: JSON.stringify({ type: 'none', by: 'user', filetype: attachment?.type ?? null, src: attachment?.url ?? null }),
          },
        });
        if (attachment?.job) await tx.job.create({
          data: {
            kind: 'RenderVideo', dedupe_key: 'render-comment-video:' + comment.id,
            payload: attachment.job, available_at: new Date(),
          },
        });
        return '{"errorcode":"0","error":0}';
      });
      saved = result === '{"errorcode":"0","error":0}';
      return result;
    } finally {
      if (!saved && attachment) await unlink(attachment.path).catch(() => undefined);
    }
  }
}
