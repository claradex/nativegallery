import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ContestsController } from './ContestsController';

import { AdminContestsController } from './AdminContestsController';

import { ContestResultsController } from './ContestResultsController';

@Module({ imports: [AuthModule], controllers: [ContestsController, AdminContestsController, ContestResultsController] })
export class ContestsModule {}
