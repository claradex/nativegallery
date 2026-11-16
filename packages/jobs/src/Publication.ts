import { database, Prisma } from '@nativegallery/database';
import type { StoragePublishMode } from '@nativegallery/contracts';

type Client = Prisma.TransactionClient | typeof database;

/**
 * Queues publication of a photo's files to the external storages that take it: every enabled storage when the photo
 * is approved, only the «all uploads» ones while it waits for moderation. The dedupe key makes repeated calls (an
 * approval after the upload already queued it) a no-op.
 */
export async function queuePublication(client: Client, photoId: number, approved: boolean) {
  const targets = await client.storageTarget.findMany({
    where: { enabled: true, ...(approved ? {} : { mode: 'all' }) }, select: { id: true },
  });
  if (!targets.length) return 0;
  const { count } = await client.job.createMany({
    data: targets.map(target => ({
      kind: 'PublishMedia', dedupe_key: 'publish-media:' + target.id + ':' + photoId,
      payload: { targetId: target.id, photoId }, available_at: new Date(),
    })),
    skipDuplicates: true,
  });
  return count;
}

/** SQL condition on `photos p` for the photos a storage should hold. Photos of the PHP version on other hosts are skipped. */
export function eligiblePhotos(mode: string) {
  return Prisma.sql`p.photourl LIKE '/uploads/%' AND ${(mode as StoragePublishMode) === 'published' ? Prisma.sql`p.moderated = 1` : Prisma.sql`p.moderated <> -1`}`;
}

/**
 * Queues publication of every photo the storage should hold but does not fully have: no replica rows yet, or some
 * file not published (failed, missing, mismatched). `since` limits it to photos uploaded after a moment (seconds).
 * Returns how many jobs were queued.
 */
export async function queueMissingPublications(targetId: number, mode: string, options: { since?: number; force?: boolean } = {}) {
  const stamp = Date.now().toString(36);
  const since = options.since === undefined ? Prisma.empty : Prisma.sql`AND p.timeupload >= ${options.since}`;
  return database.$executeRaw(Prisma.sql`
    INSERT IGNORE INTO ng_jobs (kind, dedupe_key, payload, available_at, attempts)
    SELECT 'PublishMedia', CONCAT('publish-media:', ${targetId}, ':', p.id, ':', ${stamp}),
      JSON_OBJECT('targetId', ${targetId}, 'photoId', p.id, 'force', ${options.force ? Prisma.sql`TRUE` : Prisma.sql`FALSE`}), NOW(3), 0
    FROM photos p
    WHERE ${eligiblePhotos(mode)} ${since}
      AND (NOT EXISTS (SELECT 1 FROM ng_media_replicas r WHERE r.target_id = ${targetId} AND r.photo_id = p.id)
        OR EXISTS (SELECT 1 FROM ng_media_replicas r WHERE r.target_id = ${targetId} AND r.photo_id = p.id AND r.status <> 1))
      AND NOT EXISTS (SELECT 1 FROM ng_jobs j WHERE j.kind = 'PublishMedia' AND j.completed_at IS NULL
        AND (j.dedupe_key = CONCAT('publish-media:', ${targetId}, ':', p.id) OR j.dedupe_key LIKE CONCAT('publish-media:', ${targetId}, ':', p.id, ':%')))
  `);
}
