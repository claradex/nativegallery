import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import type { Request, Response } from 'express';
import { database } from '@nativegallery/database';
import type { LoginRequest, LoginResponse, Viewer } from '@nativegallery/contracts';

const sessionAge = 50 * 50 * 54 * 72 * 1000;
const failure: LoginResponse = { errorcode: '1', error: 1 };
const sessionCookie = 'NGALLERYSESS';
export const sessionCookies = [sessionCookie, 'NGALLERYSERVICE', 'NGALLERYSESS_', 'NGALLERYID'];

export function sessionToken(request: Request) {
  return request.headers.cookie?.match(/(?:^|;\s*)NGALLERYSESS=([a-f0-9-]{36})(?:;|$)/i)?.[1];
}

@Injectable()
export class AuthService {
  async viewer(request: Request): Promise<Viewer | null> {
    const token = sessionToken(request);
    if (!token) return null;
    const lastValid = BigInt(Math.floor((Date.now() - sessionAge) / 1000));
    const session = await database.loginToken.findFirst({
      where: { token: 'v2:' + token, created_at: { gte: lastValid } },
    });
    if (!session) return null;
    const user = await database.user.findUnique({
      where: { id: session.user_id }, select: { id: true, username: true, status: true, admin: true },
    });
    if (!user || user.status === 1) return null;
    const now = Math.floor(Date.now() / 1000);
    const [unreadPhotos, pendingPhotos] = await Promise.all([
      database.followerNotification.count({ where: { follower_id: user.id, checked: 0 } }),
      user.admin > 0 ? database.photo.count({ where: { moderated: 0 } }) : 0,
      database.user.update({ where: { id: user.id }, data: { online: now } }),
    ]);
    return { ...user, unreadPhotos, pendingPhotos };
  }

  async login(body: Partial<LoginRequest>, response: Response): Promise<LoginResponse> {
    if (typeof body?.username !== 'string' || !body.username || body.username.length > 255 ||
        typeof body?.password !== 'string' || !body.password || body.password.length > 1024) return failure;
    const user = await database.user.findFirst({
      where: { OR: [{ username: { contains: body.username } }, { email: { contains: body.username } }] },
      orderBy: { id: 'asc' },
    });
    if (!user || user.status === 1 || !await compare(body.password, user.password.replace(/^\$2y\$/, () => '$2b$'))) return failure;
    return this.startSession(user.id, response);
  }

  async startSession(userId: number, response: Response): Promise<LoginResponse> {
    const token = randomUUID();
    const now = BigInt(Math.floor(Date.now() / 1000));
    await database.loginToken.create({
      data: { token: 'v2:' + token, user_id: userId, iv: new Uint8Array(16), device_name: '', os: '',
        ip: '', location: '', created_at: now, last_activity: now },
    });
    const options = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.COOKIE_SECURE === 'true', path: '/', maxAge: sessionAge };
    response.cookie(sessionCookie, token, options);
    response.cookie('NGALLERYSERVICE', randomUUID(), options);
    response.cookie('NGALLERYSESS_', '1', options);
    response.cookie('NGALLERYID', String(userId), options);
    return { errorcode: '0', error: 0, token };
  }
}
