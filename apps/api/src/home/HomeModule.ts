import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { AdminHomeBlocksController } from './AdminHomeBlocksController';
import { HomeController } from './HomeController';

@Module({ imports: [AuthModule], controllers: [HomeController, AdminHomeBlocksController] })
export class HomeModule {}
