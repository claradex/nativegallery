import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { JobsController } from './JobsController';

@Module({ imports: [AuthModule], controllers: [JobsController] })
export class JobsModule {}
