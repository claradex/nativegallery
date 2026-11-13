import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { PhotoPageController } from './PhotoPageController';

import { PhotoModerationController } from "./PhotoModerationController";

@Module({ imports: [AuthModule], controllers: [PhotoPageController, PhotoModerationController] })
export class PhotoPageModule {}
