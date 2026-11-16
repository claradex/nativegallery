import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

import { VehicleSearchController } from "./VehicleSearchController";

import { VehicleRequestController } from './VehicleRequestController';

import { VehicleModerationController } from "./VehicleModerationController";

import { AdminVehicleEditorController } from './AdminVehicleEditorController';

import { AdminEntitiesController } from './AdminEntitiesController';

import { ModelListController } from './ModelListController';
import { ModelController } from './ModelController';

@Module({ imports: [AuthModule], controllers: [VehicleController, VehicleSearchController, VehicleRequestController, VehicleModerationController, AdminVehicleEditorController, AdminEntitiesController, ModelListController, ModelController] })
export class VehicleModule {}
