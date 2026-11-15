import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { ConfigController } from './ConfigController';

@Module({ imports: [AuthModule], controllers: [ConfigController] })
export class ConfigModule {}
