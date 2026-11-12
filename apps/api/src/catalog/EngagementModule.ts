import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { EngagementController } from './EngagementController';

@Module({ imports: [AuthModule], controllers: [EngagementController] })
export class EngagementModule {}
