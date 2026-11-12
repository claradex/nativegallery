import { Controller, ForbiddenException, Get, Header, Module, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthModule, AuthService } from '../auth/AuthModule';

@Controller('api/contests')
class ContestsController {
  constructor(private readonly auth: AuthService) {}

  @Get('getinfo')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async info(@Req() request: Request) {
    if (!await this.auth.viewer(request)) throw new ForbiddenException();
    const contest = await database.contest.findFirst({
      where: { status: { in: [0, 1, 2] } }, orderBy: [{ status: 'asc' }, { id: 'asc' }],
    });
    const now = Math.floor(Date.now() / 1000);
    const status = contest?.status;
    const pretends = status === 0 ? (contest!.openpretendsdate > now ? 'waiting' : 'waitingforserver')
      : status === 1 ? (contest!.closepretendsdate > now ? 'opened' : 'waitingforserver') : 'closed';
    const voting = status === 2 ? (contest!.closedate > now ? 'opened' : 'waitingforserver') : 'closed';
    return JSON.stringify({ contest, statuses: { pretends, public: voting } });
  }
}

@Module({ imports: [AuthModule], controllers: [ContestsController] })
export class ContestsModule {}
