import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { PhotoCommentsController } from './PhotoCommentsController';

import { CommentFeedController } from './CommentFeedController';

@Module({ imports: [AuthModule], controllers: [PhotoCommentsController, CommentFeedController] })
export class PhotoCommentsModule {}
