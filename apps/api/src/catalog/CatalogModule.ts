import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

import { AdminGeoController } from './AdminGeoController';

import { AdminUsersController } from './AdminUsersController';

@Module({ imports: [AuthModule], controllers: [CatalogController, AdminGeoController, AdminUsersController] })
export class CatalogModule {}
