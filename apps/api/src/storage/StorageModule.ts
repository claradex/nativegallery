import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { AdminStorageController } from './AdminStorageController';

@Module({ imports: [AuthModule], controllers: [AdminStorageController] })
export class StorageModule {}
