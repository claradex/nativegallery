import { Module } from '@nestjs/common';
import { PhotoDetailsController } from './PhotoDetailsController';

@Module({ controllers: [PhotoDetailsController] })
export class PhotoDetailsModule {}
