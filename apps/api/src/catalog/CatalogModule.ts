import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

import { AdminGeoController } from './AdminGeoController';

import { AdminUsersController } from './AdminUsersController';

import { AuthorController } from './AuthorController';

@Module({ imports: [AuthModule], controllers: [CatalogController, AdminGeoController, AdminUsersController, AuthorController] })
export class CatalogModule {}
