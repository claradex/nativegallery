import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

@Module({ imports: [AuthModule], controllers: [CatalogController] })
export class CatalogModule {}
