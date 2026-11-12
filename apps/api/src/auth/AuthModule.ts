import { Module } from '@nestjs/common';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';

@Module({ controllers: [AuthController], providers: [AuthService], exports: [AuthService] })
export class AuthModule {}
