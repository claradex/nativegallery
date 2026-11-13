import { All, BadRequestException, Body, Controller, ForbiddenException, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function timestamp(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)?$/.test(value)) throw new BadRequestException();
  const seconds = Date.parse(value.length === 16 ? value + '+03:00' : value) / 1000;
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 2147483647) throw new BadRequestException();
  return seconds;
}

@Controller('api/admin/contests')
export class AdminContestsController {
  constructor(private readonly auth: AuthService) {}

  private async authorize(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.authorize(request);
    const [contests, themes, schedule] = await Promise.all([
      database.contest.findMany({ orderBy: { id: 'desc' } }),
      database.contestTheme.findMany({ orderBy: { id: 'asc' } }),
      database.jobSchedule.findUnique({ where: { kind: 'ExecContests' } }),
    ]);
    return { contests, themes, enabled: process.env.CONTESTS_ENABLED === 'true' && (schedule?.enabled ?? true) };
  }

  @All('createtheme')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async createTheme(@Req() request: Request, @Body('body') title: unknown, @Body('active') active: unknown) {
    await this.authorize(request);
    if (typeof title !== 'string' || !title.trim() || Buffer.byteLength(title) > 65535) throw new BadRequestException();
    await database.contestTheme.create({ data: { title: title.trim(), status: active === '1' ? 1 : 0 } });
    return '{"errorcode":0,"error":0}';
  }

  @All('create')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.authorize(request);
    const themeid = Number(body?.themeid);
    if (!Number.isInteger(themeid) || themeid < 1 || themeid > 2147483647) throw new BadRequestException();
    const openpretendsdate = timestamp(body.openpretendsdate);
    const closepretendsdate = timestamp(body.closepretendsdate);
    const opendate = body.startContestNow === '1' ? closepretendsdate : timestamp(body.opendate);
    const closedate = timestamp(body.closedate);
    if (openpretendsdate >= closepretendsdate || closepretendsdate > opendate || opendate >= closedate) throw new BadRequestException();
    if (!await database.contestTheme.findUnique({ where: { id: themeid } })) throw new BadRequestException();
    await database.contest.create({ data: { themeid, openpretendsdate, closepretendsdate, opendate, closedate, status: 0 } });
    return '{"errorcode":0,"error":0}';
  }
}
