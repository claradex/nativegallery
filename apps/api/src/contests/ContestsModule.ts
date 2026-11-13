import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ContestsController } from './ContestsController';

import { AdminContestsController } from './AdminContestsController';

import { ContestResultsController } from './ContestResultsController';

import { ContestVotingController } from './ContestVotingController';

@Module({ imports: [AuthModule], controllers: [ContestsController, AdminContestsController, ContestResultsController, ContestVotingController] })
export class ContestsModule {}
