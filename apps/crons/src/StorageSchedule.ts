import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { durationSeconds } from '@nativegallery/contracts';
import { flag, setting } from '@nativegallery/config';
import { database } from '@nativegallery/database';
import { enabled } from '@nativegallery/jobs';

/**
 * Queues the scheduled check of every enabled external storage once STORAGE_VERIFY_EVERY has passed since its last
 * check. The media worker does the checking; this only decides when.
 */
@Injectable()
export class StorageSchedule {
  @Cron('*/5 * * * *', { waitForCompletion: true })
  async tick() {
    const every = setting('STORAGE_VERIFY_EVERY');
    const seconds = every === 'off' ? null : durationSeconds(every);
    if (!seconds || !await enabled('VerifyMedia')) return;
    const since = new Date(Date.now() - seconds * 1000);
    const targets = await database.storageTarget.findMany({
      where: { enabled: true, OR: [{ last_check_at: null }, { last_check_at: { lte: since } }] }, select: { id: true },
    });
    // A long check still running (or waiting) is not doubled.
    const running = await database.job.findMany({
      where: { kind: 'VerifyMedia', completed_at: null }, select: { payload: true },
    });
    const busy = new Set(running.map(job => (job.payload as { targetId?: unknown } | null)?.targetId));
    const due = targets.filter(target => !busy.has(target.id));
    if (!due.length) return;
    const slot = Math.floor(Date.now() / 1000 / seconds);
    await database.job.createMany({
      data: due.map(target => ({
        kind: 'VerifyMedia', dedupe_key: 'verify-media:' + target.id + ':scheduled:' + seconds + ':' + slot,
        payload: { targetId: target.id, deep: flag('STORAGE_VERIFY_DEEP'), scheduled: true }, available_at: new Date(),
      })),
      skipDuplicates: true,
    });
  }
}
