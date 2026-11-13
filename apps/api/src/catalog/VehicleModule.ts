import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/AuthModule';
import { VehicleController } from './VehicleController';

@Module({ imports: [AuthModule], controllers: [VehicleController] })
export class VehicleModule {}
