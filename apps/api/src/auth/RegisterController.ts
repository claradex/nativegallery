import { Body, Controller, Get, Header, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from './AuthService';

import { verificationMailer } from './VerificationMailer';

const failure = (errorcode: string, errortitle: string) => ({ errorcode, errortitle, error: 1 });

@Controller('api/register')
@Header('Cache-Control', 'private, no-store')
export class RegisterController {
  constructor(private readonly auth: AuthService) {}

  @Get('options')
  options() {
    return { open: process.env.REGISTRATION_PUBLIC === 'true' && (process.env.EMAIL_VERIFY !== 'true' || verificationMailer() !== null) };
  }

  @Post()
  @HttpCode(200)
  async register(@Body() form: Record<string, unknown>, @Res({ passthrough: true }) response: Response) {
    if (!this.options().open) return failure('8', 'Регистрация закрыта.');
    const username = typeof form?.username === 'string' ? form.username.trim() : '';
    const email = typeof form?.email === 'string' ? form.email.trim().toLowerCase() : '';
    const password = typeof form?.password === 'string' ? form.password.trim() : '';
    if (Array.from(username).length < 2 || Array.from(username).length > 20 || /[\u0000-\u001f\u007f]/.test(username)) {
      return failure('5', 'Никнейм некорректный!');
    }
    const prohibited = (process.env.REGISTRATION_PROHIBITED_USERNAMES ?? '').split(',').map(value => value.trim().toLowerCase());
    if (prohibited.includes(username.toLowerCase())) return failure('7', 'Никнейм запрещён на сервере.');
    if (Array.from(password).length < 5 || Buffer.byteLength(password) > 72) {
      return failure('4', 'Пароль должен содержать от 5 символов и занимать не более 72 байт.');
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return failure('3', 'Почта некорректного формата!');
    const mailer = process.env.EMAIL_VERIFY === 'true' ? verificationMailer() : null;
    if (process.env.EMAIL_VERIFY === 'true' && !mailer) return failure('8', 'Регистрация закрыта.');
    const token = mailer ? randomUUID() : null;
    const encrypted = await hash(password, 12);
    const now = Math.floor(Date.now() / 1000);
    const result = await database.$transaction(async tx => {
      const existing = await tx.user.findFirst({ where: { username }, select: { id: true, status: true, email: true, password: true } });
      if (existing && token && existing.status === 3 && existing.email.toLowerCase() === email &&
          await compare(password, existing.password.replace(/^\$2y\$/, () => '$2b return failure('6', 'Никнейм уже существует!');
      if (await tx.user.findFirst({ where: { email }, select: { id: true } })) return failure('2', 'Пользователь с такой почтой уже существует!');
      const account = await tx.user.create({ data: {
        username, email, password: encrypted, photourl: '/static/img/avatar.png', uploadindex: 5,
        online: now, admin: 0, status: token ? 3 : 0, content: JSON.stringify({ route: 'NONE', regdate: now }),
      }, select: { id: true } });
      if (token) await tx.serviceKey.create({ data: {
        token, type: 'EMAILVERIFY', status: 1, content: JSON.stringify({ user_id: account.id }),
      } });
      return account;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }).catch(error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        return failure('8', 'Повторите попытку регистрации.');
      }
      throw error;
    });
    if (!('id' in result)) return result;
    if (mailer && token) {
      try {
        await mailer.send(email, token);
      } catch {
        await database.serviceKey.updateMany({ where: { token, type: 'EMAILVERIFY' }, data: { status: 0 } });
        return failure('8', 'Не удалось отправить письмо. Повторите регистрацию с теми же данными.');
      }
    }
    return this.auth.startSession(result.id, response);
  }
}
))) {
        await tx.serviceKey.create({ data: { token, type: 'EMAILVERIFY', status: 1, content: JSON.stringify({ user_id: existing.id }) } });
        return { id: existing.id };
      }
      if (existing) return failure('6', 'Никнейм уже существует!');
      if (await tx.user.findFirst({ where: { email }, select: { id: true } })) return failure('2', 'Пользователь с такой почтой уже существует!');
      return tx.user.create({ data: {
        username, email, password: encrypted, photourl: '/static/img/avatar.png', uploadindex: 5,
        online: now, admin: 0, status: 0, content: JSON.stringify({ route: 'NONE', regdate: now }),
      }, select: { id: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }).catch(error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        return failure('8', 'Повторите попытку регистрации.');
      }
      throw error;
    });
    return 'id' in result ? this.auth.startSession(result.id, response) : result;
  }
}
