import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

import { VehicleSearchController } from "./VehicleSearchController";

@Module({ imports: [AuthModule], controllers: [VehicleController, VehicleSearchController] })
export class VehicleModule {}
