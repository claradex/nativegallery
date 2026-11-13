import { Module } from '@nestjs/common';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';

import { RegisterController } from './RegisterController';

import { EmailVerificationController } from './EmailVerificationController';

@Module({ controllers: [AuthController, RegisterController, EmailVerificationController], providers: [AuthService], exports: [AuthService] })
export class AuthModule {}
