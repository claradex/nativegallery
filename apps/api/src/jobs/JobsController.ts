import { All, BadRequestException, Controller, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { jobKinds, type JobKind } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/admin/settings')
export class JobsController {
  constructor(private readonly auth: AuthService) {}

  /** Every schedulable job kind with its switch and queue state (the media kinds used to be missing here). */
  @Get('tasks')
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'editor');
    const dayAgo = new Date(Date.now() - 86_400_000);
    const [schedules, pending, failing, done, lastDone, lastFailure] = await Promise.all([
      database.jobSchedule.findMany({ where: { kind: { in: [...jobKinds] } } }),
      database.job.groupBy({ by: ['kind'], where: { completed_at: null }, _count: { _all: true } }),
      database.job.groupBy({ by: ['kind'], where: { completed_at: null, last_error: { not: null } }, _count: { _all: true } }),
      database.job.groupBy({ by: ['kind'], where: { completed_at: { gte: dayAgo } }, _count: { _all: true } }),
      database.job.groupBy({ by: ['kind'], where: { completed_at: { not: null } }, _max: { completed_at: true } }),
      Promise.all(jobKinds.map(kind => database.job.findFirst({
        where: { kind, completed_at: null, last_error: { not: null } }, orderBy: { id: 'desc' },
        select: { kind: true, last_error: true },
      }))),
    ]);
    const count = (rows: { kind: string; _count: { _all: number } }[], kind: string) =>
      rows.find(row => row.kind === kind)?._count._all ?? 0;
    return jobKinds.map(id => ({
      id,
      enabled: schedules.find(schedule => schedule.kind === id)?.enabled ?? true,
      pending: count(pending, id),
      failing: count(failing, id),
      completedToday: count(done, id),
      lastCompletedAt: lastDone.find(row => row.kind === id)?._max.completed_at ?? null,
      lastError: lastFailure.find(row => row?.kind === id)?.last_error ?? null,
    }));
  }

  @All('taskmanager')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async toggle(@Req() request: Request, @Query('id') id: JobKind, @Query('type') type: string) {
    await this.auth.requireAdmin(request, 'editor');
    if (!jobKinds.includes(id) || (type !== '0' && type !== '1')) throw new BadRequestException();
    const enabled = type !== '0';
    await database.jobSchedule.upsert({
      where: { kind: id }, create: { kind: id, enabled }, update: { enabled },
    });
    return '{"errorcode":0,"error":0}';
  }
}
