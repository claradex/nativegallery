import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { PhotoCommentsController } from './PhotoCommentsController';

@Module({ imports: [AuthModule], controllers: [PhotoCommentsController] })
export class PhotoCommentsModule {}
