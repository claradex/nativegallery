import { Module } from '@nestjs/common';
import { PhotoStatsController } from './PhotoStatsController';

@Module({ controllers: [PhotoStatsController] })
export class PhotoStatsModule {}
