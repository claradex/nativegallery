import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

import { VehicleSearchController } from "./VehicleSearchController";

import { VehicleRequestController } from './VehicleRequestController';

import { VehicleModerationController } from "./VehicleModerationController";

import { AdminVehicleEditorController } from './AdminVehicleEditorController';

import { AdminEntitiesController } from './AdminEntitiesController';

@Module({ imports: [AuthModule], controllers: [VehicleController, VehicleSearchController, VehicleRequestController, VehicleModerationController, AdminVehicleEditorController, AdminEntitiesController] })
export class VehicleModule {}
