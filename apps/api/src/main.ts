import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './ApiModule';

async function main() {
  const app = await NestFactory.create(ApiModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 3001), '0.0.0.0');
}

void main();
