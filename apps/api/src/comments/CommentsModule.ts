import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CommentsController } from './CommentsController';

import { EmojiController } from './EmojiController';

@Module({ imports: [AuthModule], controllers: [CommentsController, EmojiController] })
export class CommentsModule {}
