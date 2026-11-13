import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

import { AdminGeoController } from './AdminGeoController';

import { AdminUsersController } from './AdminUsersController';

import { AuthorController } from './AuthorController';

import { PhotoSearchController } from './PhotoSearchController';

@Module({ imports: [AuthModule], controllers: [CatalogController, AdminGeoController, AdminUsersController, AuthorController, PhotoSearchController] })
export class CatalogModule {}
