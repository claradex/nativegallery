import { Module } from '@nestjs/common';
import { PhotosController } from './PhotosController';

import { AuthModule } from '../auth/AuthModule';
import { PhotoUploadController } from './PhotoUploadController';

@Module({ imports: [AuthModule], controllers: [PhotosController, PhotoUploadController] })
export class PhotosModule {}
