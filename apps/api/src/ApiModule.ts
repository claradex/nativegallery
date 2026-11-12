import { Module } from '@nestjs/common';
import { HealthController } from './HealthController';
import { AuthModule } from './auth/AuthModule';
import { CatalogModule } from './catalog/CatalogModule';
import { HomeModule } from './home/HomeModule';
import { PhotoRatingsModule } from "./photos/PhotoRatingsModule";
import { PhotoDetailsModule } from './photos/PhotoDetailsModule';
import { PhotoStatsModule } from "./photos/PhotoStatsModule";
import { PhotoPageModule } from './photos/PhotoPageModule';
import { PhotosModule } from './photos/PhotosModule';
import { ContestsModule } from './contests/ContestsModule';
import { EngagementModule } from './catalog/EngagementModule';
import { CommentsModule } from "./comments/CommentsModule";
import { FollowingModule } from './catalog/FollowingModule';
import { PhotoCommentsModule } from "./comments/PhotoCommentsModule";
import { JobsModule } from './jobs/JobsModule';

@Module({ imports: [AuthModule, CatalogModule, JobsModule, HomeModule, PhotosModule, ContestsModule, EngagementModule, CommentsModule, PhotoRatingsModule, FollowingModule, PhotoDetailsModule, PhotoStatsModule, PhotoCommentsModule, PhotoPageModule], controllers: [HealthController] })
export class ApiModule {}
