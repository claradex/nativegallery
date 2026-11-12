import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { PhotoPageController } from './PhotoPageController';

@Module({ imports: [AuthModule], controllers: [PhotoPageController] })
export class PhotoPageModule {}
