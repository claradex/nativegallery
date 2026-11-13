import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import type { PhotoCommentData } from "@nativegallery/contracts";
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function parseContent(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // Legacy rows can contain empty or malformed metadata.
  }
  return {};
}

@Controller('api/internal')
export class PhotoCommentsController {
  constructor(private readonly auth: AuthService) {}

  @Get('photo-comments/:id')
  @Header('Cache-Control', 'private, no-store')
  async list(@Param('id') value: string, @Req() request: Request): Promise<PhotoCommentData[]> {
    const viewer = await this.auth.viewer(request);
    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647) throw new NotFoundException();
    const photo = await database.photo.findUnique({
      where: { id }, select: { user_id: true, moderated: true, pinnedcomment_id: true },
    });
    if (!photo || (photo.moderated !== 1 && viewer?.id !== photo.user_id && !viewer?.admin)) {
      throw new NotFoundException();
    }
    const rows = await database.photoComment.findMany({ where: { photo_id: id }, orderBy: { id: 'asc' } });
    const comments = rows.map(row => ({ ...row, content: parseContent(row.content) }))
      .filter(row => row.content.deleted !== 'true' && row.content.deleted !== true);
    const ids = comments.map(comment => comment.id);
    const authors = [...new Set(comments.map(comment => comment.user_id))];
    const [users, votes, ownVotes, photoCounts] = await Promise.all([
      database.user.findMany({
        where: { id: { in: authors } },
        select: { id: true, username: true, photourl: true, admin: true },
      }),
      database.photoCommentRate.groupBy({
        by: ['comment_id', 'type'], where: { comment_id: { in: ids } }, _count: { _all: true },
      }),
      viewer ? database.photoCommentRate.findMany({
        where: { user_id: viewer.id, comment_id: { in: ids } }, orderBy: { id: 'desc' },
      }) : [],
      database.photo.groupBy({
        by: ['user_id'], where: { user_id: { in: authors }, moderated: 1 }, _count: { _all: true },
      }),
    ]);
    const usersById = new Map(users.map(user => [user.id, user]));
    const ownById = new Map(ownVotes.map(vote => [vote.comment_id, vote.type]));
    const publishedById = new Map(photoCounts.map(row => [row.user_id, row._count._all]));
    const scores = new Map(votes.map(row => [row.comment_id + ':' + row.type, row._count._all]));
    const pinned = photo.pinnedcomment_id;
    comments.sort((a, b) => Number(b.id === pinned) - Number(a.id === pinned) || a.id - b.id);
    return comments.map(comment => ({
      id: comment.id, authorId: comment.user_id, author: usersById.get(comment.user_id) ?? null,
      publishedPhotos: publishedById.get(comment.user_id) ?? 0,
      body: comment.body, postedAt: comment.posted_at, edited: comment.content.edited === 'true',
      attachmentType: comment.content.filetype === 'img' || comment.content.filetype === 'video'
        ? comment.content.filetype : null,
      attachmentUrl: typeof comment.content.src === 'string' ? comment.content.src : null,
      pinned: comment.id === pinned,
      positive: scores.get(comment.id + ':1') ?? 0,
      negative: scores.get(comment.id + ':0') ?? 0,
      ownVote: ownById.get(comment.id) ?? null,
      canEdit: viewer?.id === comment.user_id,
      canPin: viewer?.id === photo.user_id,
    }));
  }
}
