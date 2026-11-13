import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { AdminNewsController } from './AdminNewsController';

import { PublicNewsController } from './PublicNewsController';

@Module({ imports: [AuthModule], controllers: [AdminNewsController, PublicNewsController] })
export class NewsModule {}
