import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ContestsController } from './ContestsController';

@Module({ imports: [AuthModule], controllers: [ContestsController] })
export class ContestsModule {}
