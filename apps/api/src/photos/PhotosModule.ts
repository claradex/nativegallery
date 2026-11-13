import { Module } from '@nestjs/common';
import { PhotosController } from './PhotosController';

import { AuthModule } from '../auth/AuthModule';
import { PhotoUploadController } from './PhotoUploadController';

import { PublicMediaController } from './PublicMediaController';

import { GalleryController } from './GalleryController';

@Module({ imports: [AuthModule], controllers: [PhotosController, PhotoUploadController, PublicMediaController, GalleryController] })
export class PhotosModule {}
