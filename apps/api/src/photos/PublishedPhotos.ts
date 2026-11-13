import { database } from '@nativegallery/database';

export async function publishedPhotos(galleryId?: number) {
  const photos = await database.photo.findMany({
    where: { gallery_id: galleryId, moderated: 1 }, orderBy: { id: 'desc' }, take: 100,
    select: { id: true, photourl: true, postbody: true, place: true, posted_at: true, timeupload: true, user_id: true },
  });
  const [authors, views] = await Promise.all([
    database.user.findMany({
      where: { id: { in: [...new Set(photos.map(photo => photo.user_id))] } },
      select: { id: true, username: true },
    }),
    database.photoView.groupBy({
      by: ['photo_id'], where: { photo_id: { in: photos.map(photo => photo.id) } }, _count: { photo_id: true },
    }),
  ]);
  const names = new Map(authors.map(author => [author.id, author.username]));
  const totals = new Map(views.map(view => [view.photo_id, view._count.photo_id]));
  return photos.map(({ posted_at, timeupload, user_id, ...photo }) => ({
    ...photo, postedAt: posted_at, uploadedAt: timeupload, authorId: user_id,
    author: names.get(user_id) ?? '', views: totals.get(photo.id) ?? 0,
  }));
}
