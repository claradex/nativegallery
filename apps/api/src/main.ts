import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/AuthModule';
import { CatalogModule } from './catalog/CatalogModule';
import { JobsModule } from './jobs/JobsModule';

@Controller('api')
class HealthController {
  @Get('health')
  health() { return { status: 'ok' }; }
}

@Module({ imports: [AuthModule, CatalogModule, JobsModule], controllers: [HealthController] })
class ApiModule {}

async function main() {
  const app = await NestFactory.create(ApiModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 3001), '0.0.0.0');
}

void main();
