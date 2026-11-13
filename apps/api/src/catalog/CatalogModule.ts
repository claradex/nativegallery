import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

import { AdminGeoController } from './AdminGeoController';

@Module({ imports: [AuthModule], controllers: [CatalogController, AdminGeoController] })
export class CatalogModule {}
