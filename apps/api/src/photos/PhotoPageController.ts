import { Controller, Get, Header, NotFoundException, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { PhotoPageData } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/internal')
export class PhotoPageController {
  constructor(private readonly auth: AuthService) {}

  @Get('photo-page/:id')
  @Header('Cache-Control', 'private, no-store')
  async getPhoto(@Param('id') rawId: string, @Req() request: Request, @Query() scope: Record<string, unknown>): Promise<PhotoPageData> {
    const id = Number(rawId);
    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) throw new NotFoundException();
    const viewer = await this.auth.viewer(request);
    const photo = await database.photo.findUnique({
      where: { id },
      select: { id: true, user_id: true, photourl: true, place: true, postbody: true,
        posted_at: true, timeupload: true, moderated: true, content: true, priority: true, on_contest: true,
        gallery_id: true, entitydata_id: true },
    });
    if (!photo || (photo.moderated !== 1 && (photo.moderated !== 0 ||
      (!viewer?.admin && viewer?.id !== photo.user_id)))) throw new NotFoundException();
    const groups = [
      ['vid', 'entitydata_id', photo.entitydata_id],
      ['gid', 'gallery_id', photo.gallery_id],
      ['aid', 'user_id', photo.user_id],
    ] as const;
    const requested = groups.find(([key, , value]) => value > 0 && scope[key] === String(value));
    const group = requested ?? (photo.entitydata_id > 0 ? groups[0] : undefined);
    const neighbors = { moderated: 1, ...(group ? { [group[1]]: group[2] } : {}) };
    const [author, views, favorite, previous, next] = await Promise.all([
      database.user.findUnique({ where: { id: photo.user_id }, select: { username: true } }),
      database.photoView.count({ where: { photo_id: id } }),
      viewer ? database.photoFavorite.findFirst({ where: { photo_id: id, user_id: viewer.id }, select: { id: true } }) : null,
      database.photo.findFirst({ where: { ...neighbors, id: { gt: id } }, orderBy: { id: 'asc' }, select: { id: true } }),
      database.photo.findFirst({ where: { ...neighbors, id: { lt: id } }, orderBy: { id: 'desc' }, select: { id: true } }),
    ]);
    let commentsEnabled = true;
    let ratingEnabled = true;
    let videoUrl: string | null = null;
    let contestPlaces: number[] = [];
    try {
      const content = JSON.parse(photo.content);
      commentsEnabled = content?.comments !== 'disabled';
      ratingEnabled = content?.rating !== 'disabled';
      if (typeof content?.videourl === 'string') videoUrl = content.videourl;
      if (Array.isArray(content?.contests)) {
        contestPlaces = content.contests.map((entry: { place?: unknown } | null) => entry?.place)
          .filter((place: unknown): place is number => place === 1 || place === 2 || place === 3);
      }
    } catch {}
    let rating: PhotoPageData['rating'] = null;
    if (photo.moderated === 1 && ratingEnabled) {
      const votes = await database.photoRate.findMany({ where: { photo_id: id }, orderBy: { id: 'desc' } });
      const users = await database.user.findMany({
        where: { id: { in: [...new Set(votes.map(vote => vote.user_id))] } },
        select: { id: true, username: true },
      });
      const names = new Map(users.map(user => [user.id, user.username]));
      rating = {
        total: votes.reduce((total, vote) => total + (vote.type === 1 ? 1 : -1), 0),
        current: votes.find(vote => vote.contest === 0 && vote.user_id === viewer?.id)?.type ?? null,
        votes: votes.filter(vote => vote.contest === 0).map(vote => ({
          id: vote.id, authorId: vote.user_id, author: names.get(vote.user_id) ?? '', type: vote.type,
        })),
      };
    }
    return {
      id, authorId: photo.user_id, author: author?.username ?? '', url: photo.photourl,
      place: photo.place, description: photo.postbody, takenAt: photo.posted_at, publishedAt: photo.timeupload,
      published: photo.moderated === 1, videoUrl, priority: photo.priority,
      contestEntry: photo.on_contest === 2, contestPlaces, previousId: previous?.id ?? null, nextId: next?.id ?? null, views, favorite: !!favorite, signedIn: !!viewer, commentsEnabled, rating,
      canComment: !!viewer && (process.env.EMAIL_VERIFY !== "true" || viewer.status !== 3),
    };
  }
}
