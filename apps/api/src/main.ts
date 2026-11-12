import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/AuthModule';
import { CatalogModule } from './catalog/CatalogModule';
import { HomeModule } from './home/HomeModule';
import { PhotoRatingsModule } from "./photos/PhotoRatingsModule";
import { PhotosModule } from './photos/PhotosModule';
import { ContestsModule } from './contests/ContestsModule';
import { EngagementModule } from './catalog/EngagementModule';
import { CommentsModule } from "./comments/CommentsModule";
import { FollowingModule } from './catalog/FollowingModule';
import { JobsModule } from './jobs/JobsModule';

@Controller('api')
class HealthController {
  @Get('health')
  health() { return { status: 'ok' }; }
}

@Module({ imports: [AuthModule, CatalogModule, JobsModule, HomeModule, PhotosModule, ContestsModule, EngagementModule, CommentsModule, PhotoRatingsModule, FollowingModule], controllers: [HealthController] })
class ApiModule {}

async function main() {
  const app = await NestFactory.create(ApiModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 3001), '0.0.0.0');
}

void main();
