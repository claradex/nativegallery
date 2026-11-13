import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CommentCreateController } from './CommentCreateController';
import { CommentManagementController } from './CommentManagementController';
import { CommentVotesController } from './CommentVotesController';
import { EmojiController } from './EmojiController';

@Module({ imports: [AuthModule], controllers: [CommentCreateController, CommentManagementController, CommentVotesController, EmojiController] })
export class CommentsModule {}
