import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { FollowingController } from './FollowingController';

@Module({ imports: [AuthModule], controllers: [FollowingController] })
export class FollowingModule {}
