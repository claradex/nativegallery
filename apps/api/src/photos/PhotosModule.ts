import { Module } from '@nestjs/common';
import { RecentPhotosController } from './RecentPhotosController';
import { PhotoThumbnailController } from './PhotoThumbnailController';

import { AuthModule } from '../auth/AuthModule';
import { PhotoUploadController } from './PhotoUploadController';

import { PublicMediaController } from './PublicMediaController';

import { GalleryController } from './GalleryController';

import { FeedController } from './FeedController';

import { UpdatesController } from './UpdatesController';

import { AdminGalleriesController } from './AdminGalleriesController';

import { PhotoMapController } from './PhotoMapController';

import { PhotoEditController } from './PhotoEditController';

@Module({ imports: [AuthModule], controllers: [RecentPhotosController, PhotoThumbnailController, PhotoUploadController, PublicMediaController, GalleryController, FeedController, UpdatesController, AdminGalleriesController, PhotoMapController, PhotoEditController] })
export class PhotosModule {}
