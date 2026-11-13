import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

import { VehicleSearchController } from "./VehicleSearchController";

import { VehicleRequestController } from './VehicleRequestController';

@Module({ imports: [AuthModule], controllers: [VehicleController, VehicleSearchController, VehicleRequestController] })
export class VehicleModule {}
