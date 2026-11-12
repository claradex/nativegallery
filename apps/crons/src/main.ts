import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ContestModule } from './ContestModule';

void NestFactory.createApplicationContext(ContestModule).then(app => app.enableShutdownHooks());
