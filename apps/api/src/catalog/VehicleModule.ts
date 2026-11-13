import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

import { VehicleSearchController } from "./VehicleSearchController";

import { VehicleRequestController } from './VehicleRequestController';

import { VehicleModerationController } from "./VehicleModerationController";

@Module({ imports: [AuthModule], controllers: [VehicleController, VehicleSearchController, VehicleRequestController, VehicleModerationController] })
export class VehicleModule {}
