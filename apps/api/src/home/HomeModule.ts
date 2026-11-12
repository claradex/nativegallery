import { Module } from '@nestjs/common';
import { HomeController } from './HomeController';

@Module({ controllers: [HomeController] })
export class HomeModule {}
