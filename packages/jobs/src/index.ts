import { randomUUID } from 'node:crypto';
import { database, type Prisma } from '@nativegallery/database';
import type { JobKind } from '@nativegallery/contracts';

export async function enqueue(kind: JobKind, key: string, payload: Prisma.InputJsonValue) {
  return database.job.upsert({
    where: { dedupe_key: key },
    create: { kind, dedupe_key: key, payload, available_at: new Date() },
    update: {},
  });
}

export async function enabled(kind: JobKind, fallback = true) {
  return (await database.jobSchedule.findUnique({ where: { kind } }))?.enabled ?? fallback;
}

export async function consume(kinds: JobKind[], handle: (kind: JobKind, payload: Prisma.JsonValue) => Promise<void>) {
  const now = new Date();
  const ready: Prisma.JobWhereInput = {
    kind: { in: kinds }, completed_at: null, available_at: { lte: now },
    OR: [{ lease_until: null }, { lease_until: { lte: now } }],
  };
  const job = await database.job.findFirst({ where: ready, orderBy: { id: 'asc' } });
  if (!job) return false;
  const token = randomUUID();
  const lease = () => new Date(Date.now() + 120_000);
  const claimed = await database.job.updateMany({
    where: { ...ready, id: job.id },
    data: { lease_token: token, lease_until: lease(), attempts: { increment: 1 } },
  });
  if (!claimed.count) return false;
  const owner = { id: job.id, lease_token: token };
  const heartbeat = setInterval(() => {
    void database.job.updateMany({ where: owner, data: { lease_until: lease() } }).catch(console.error);
  }, 30_000);
  try {
    await handle(job.kind as JobKind, job.payload);
    await database.job.updateMany({
      where: owner,
      data: { completed_at: new Date(), lease_until: null, lease_token: null, last_error: null },
    });
  } catch (error) {
    await database.job.updateMany({
      where: owner,
      data: {
        available_at: new Date(Date.now() + Math.min(300_000, 1000 * 2 ** Math.min(job.attempts, 9))),
        lease_until: null, lease_token: null, last_error: String(error).slice(0, 2000),
      },
    });
    throw error;
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}
