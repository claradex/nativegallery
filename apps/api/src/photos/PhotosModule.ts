import { Module } from '@nestjs/common';
import { PhotosController } from './PhotosController';

import { AuthModule } from '../auth/AuthModule';
import { PhotoUploadController } from './PhotoUploadController';

import { PublicMediaController } from './PublicMediaController';

import { GalleryController } from './GalleryController';

import { FeedController } from './FeedController';

import { UpdatesController } from './UpdatesController';

import { AdminGalleriesController } from './AdminGalleriesController';

import { PhotoMapController } from './PhotoMapController';

@Module({ imports: [AuthModule], controllers: [PhotosController, PhotoUploadController, PublicMediaController, GalleryController, FeedController, UpdatesController, AdminGalleriesController, PhotoMapController] })
export class PhotosModule {}
