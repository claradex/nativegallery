import { Injectable, Module } from '@nestjs/common';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { database, Prisma } from '@nativegallery/database';
import { enabled } from '@nativegallery/jobs';

@Injectable()
export class ContestSchedule {
  @Cron('* * * * *', { waitForCompletion: true })
  async tick() {
    if (process.env.CONTESTS_ENABLED !== 'true' || !await enabled('ExecContests')) return;
    await database.$transaction(async tx => {
      const rows = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`SELECT id FROM contests WHERE status < 3 ORDER BY id FOR UPDATE`);
      const contests = await tx.contest.findMany({ where: { id: { in: rows.map(row => row.id) } }, orderBy: { id: 'asc' } });
      const now = Math.floor(Date.now() / 1000);
      let accepting = contests.some(contest => contest.status === 1);
      let voting = contests.some(contest => contest.status === 2);
      for (const contest of contests) {
        const id = contest.id;
        if (contest.status === 0 && !accepting && contest.openpretendsdate <= now) {
          await tx.contest.update({ where: { id }, data: { status: 1 } });
          accepting = true;
        } else if (contest.status === 1 && !voting && contest.closepretendsdate <= now && contest.opendate <= now) {
          await tx.photo.updateMany({ where: { contest_id: id, on_contest: 1 }, data: { on_contest: 2 } });
          await tx.contest.update({ where: { id }, data: { status: 2 } });
          accepting = false;
          voting = true;
        } else if (contest.status === 2 && contest.closedate <= now) {
          await this.closeContest(tx, id, contest.themeid, now);
          voting = false;
        }
      }
    }, { timeout: 30_000 });
  }

  private async closeContest(tx: Prisma.TransactionClient, id: number, themeId: number, now: number) {
    const theme = await tx.contestTheme.findUnique({ where: { id: themeId } });
    const votes = await tx.contestRate.groupBy({
      by: ['photo_id'], where: { contest_id: id }, _count: { photo_id: true },
      orderBy: [{ _count: { photo_id: 'desc' } }, { photo_id: 'asc' }], take: 10,
    });
    let place = 0;
    for (const vote of votes) {
      const photo = await tx.photo.findUnique({ where: { id: vote.photo_id } });
      if (!photo) continue;
      place += 1;
      const content = JSON.parse(photo.content || '{}');
      const contests = Array.isArray(content?.contests) ? content.contests : [];
      contests.push({ id, contesttheme: theme?.title ?? '', votenum: vote._count.photo_id, place });
      await tx.photo.update({ where: { id: photo.id }, data: { content: JSON.stringify({ ...content, contests }) } });
      await tx.contestWinner.create({ data: { photo_id: photo.id, contest_id: id, place, date: now } });
    }
    await tx.photo.updateMany({ where: { contest_id: id }, data: { contest_id: 0, on_contest: 0 } });
    await tx.contest.update({ where: { id }, data: { status: 3 } });
  }
}

@Module({ imports: [ScheduleModule.forRoot()], providers: [ContestSchedule] })
export class ContestModule {}
