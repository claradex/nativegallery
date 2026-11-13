import type { Prisma } from '@prisma/client';

export async function notifyPhotoFollowers(tx: Prisma.TransactionClient, photoId: number, userId: number) {
  const [followers, notified] = await Promise.all([
    tx.follower.findMany({ where: { user_id: userId }, distinct: ['follower_id'], select: { follower_id: true } }),
    tx.followerNotification.findMany({ where: { photo_id: photoId }, select: { follower_id: true } }),
  ]);
  const existing = new Set(notified.map(row => row.follower_id));
  const recipients = followers.filter(row => !existing.has(row.follower_id));
  if (recipients.length) await tx.followerNotification.createMany({
    data: recipients.map(({ follower_id }) => ({ user_id: userId, follower_id, photo_id: photoId, checked: 0 })),
  });
}
