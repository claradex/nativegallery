import { Module } from '@nestjs/common';
import { PhotosController } from './PhotosController';

import { AuthModule } from '../auth/AuthModule';
import { PhotoUploadController } from './PhotoUploadController';

import { PublicMediaController } from './PublicMediaController';

@Module({ imports: [AuthModule], controllers: [PhotosController, PhotoUploadController, PublicMediaController] })
export class PhotosModule {}
