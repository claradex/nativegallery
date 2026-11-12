import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { PhotoRatingsController } from './PhotoRatingsController';

@Module({ imports: [AuthModule], controllers: [PhotoRatingsController] })
export class PhotoRatingsModule {}
