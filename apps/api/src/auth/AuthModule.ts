import { Module } from '@nestjs/common';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';

import { RegisterController } from './RegisterController';

@Module({ controllers: [AuthController, RegisterController], providers: [AuthService], exports: [AuthService] })
export class AuthModule {}
