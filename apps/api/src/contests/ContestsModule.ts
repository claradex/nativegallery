import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ContestsController } from './ContestsController';

import { AdminContestsController } from './AdminContestsController';

import { ContestResultsController } from './ContestResultsController';

import { ContestVotingController } from './ContestVotingController';

import { ContestEntriesController } from './ContestEntriesController';

@Module({ imports: [AuthModule], controllers: [ContestsController, AdminContestsController, ContestResultsController, ContestVotingController, ContestEntriesController] })
export class ContestsModule {}
