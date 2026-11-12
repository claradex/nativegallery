import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CommentsController } from './CommentsController';

@Module({ imports: [AuthModule], controllers: [CommentsController] })
export class CommentsModule {}
