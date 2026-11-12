import { All, Controller, ForbiddenException, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { jobKinds, type JobKind } from '@nativegallery/contracts';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/admin/settings')
export class JobsController {
  constructor(private readonly auth: AuthService) {}

  @All('taskmanager')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async toggle(@Req() request: Request, @Query('id') id: JobKind, @Query('type') type: string) {
    if (!(await this.auth.viewer(request))?.admin) throw new ForbiddenException();
    if (!jobKinds.includes(id)) return '';
    const enabled = type !== '0';
    await database.jobSchedule.upsert({
      where: { kind: id }, create: { kind: id, enabled }, update: { enabled },
    });
    return '{"errorcode":0,"error":0}';
  }
}
