import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { CatalogController } from './CatalogController';

import { AdminGeoController } from './AdminGeoController';

import { AdminUsersController } from './AdminUsersController';

import { AuthorController } from './AuthorController';

import { PhotoSearchController } from './PhotoSearchController';

import { AccountController } from './AccountController';

import { ProfileSettingsController } from './ProfileSettingsController';

import { SitePageController } from './SitePageController';

import { AdminPagesController } from './AdminPagesController';

@Module({ imports: [AuthModule], controllers: [CatalogController, AdminGeoController, AdminUsersController, AuthorController, PhotoSearchController, AccountController, ProfileSettingsController, SitePageController, AdminPagesController] })
export class CatalogModule {}
