import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { AdminNewsController } from './AdminNewsController';

@Module({ imports: [AuthModule], controllers: [AdminNewsController] })
export class NewsModule {}
