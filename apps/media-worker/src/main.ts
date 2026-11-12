import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MediaModule } from './MediaModule';

void NestFactory.createApplicationContext(MediaModule).then(app => app.enableShutdownHooks());
