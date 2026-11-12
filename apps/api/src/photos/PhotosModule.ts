import { Module } from '@nestjs/common';
import { PhotosController } from './PhotosController';

@Module({ controllers: [PhotosController] })
export class PhotosModule {}
