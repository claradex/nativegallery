import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ContestsController } from './ContestsController';

import { AdminContestsController } from './AdminContestsController';

@Module({ imports: [AuthModule], controllers: [ContestsController, AdminContestsController] })
export class ContestsModule {}
