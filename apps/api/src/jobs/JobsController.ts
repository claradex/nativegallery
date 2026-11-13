import { All, BadRequestException, Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { jobKinds, type JobKind } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/admin/settings')
export class JobsController {
  constructor(private readonly auth: AuthService) {}

  private async authorize(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
  }

  @Get('tasks')
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.authorize(request);
    const id = 'ExecContests';
    const schedule = await database.jobSchedule.findUnique({ where: { kind: id } });
    return [{ id, enabled: schedule?.enabled ?? true }];
  }

  @All('taskmanager')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async toggle(@Req() request: Request, @Query('id') id: JobKind, @Query('type') type: string) {
    await this.authorize(request);
    if (!jobKinds.includes(id) || (type !== '0' && type !== '1')) throw new BadRequestException();
    const enabled = type !== '0';
    await database.jobSchedule.upsert({
      where: { kind: id }, create: { kind: id, enabled }, update: { enabled },
    });
    return '{"errorcode":0,"error":0}';
  }
}
