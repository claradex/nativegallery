import { BadRequestException, Body, ConflictException, Controller, Get, Header, HttpCode, NotFoundException, Param, Post, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { findVehicle } from './VehicleData';
import { requireId } from '../common/ids';

const timestamp = () => BigInt(Math.floor(Date.now() / 1000));
const recent = (user_id: number) => ({ user_id, created_at: { gt: timestamp() - 82800n } });

@Controller('api/vehicles/requests')
export class VehicleRequestController {
  constructor(private readonly auth: AuthService) {}

  private async context(request: Request, value: string) {
    const viewer = await this.auth.requireViewer(request);
    const id = requireId(value);
    const model = await database.entity.findUnique({ where: { id } });
    if (!model) throw new NotFoundException();
    let schema: unknown;
    try { schema = JSON.parse(model.sampledata); } catch { throw new BadRequestException(); }
    if (!schema || typeof schema !== 'object') throw new BadRequestException();
    const labels = Object.values(schema).map(field => typeof field?.name === 'string' ? field.name : '');
    return { userId: viewer.id, id, labels };
  }

  @Get(':model')
  @Header('Cache-Control', 'private, no-store')
  async form(@Req() request: Request, @Param('model') value: string, @Query('num') num?: string, @Query('gos') gos?: string) {
    const { userId, id, labels } = await this.context(request, value);
    const target = typeof num === 'string' && /^\d{1,10}$/.test(num) && Number(num) <= 2147483647 ? Number(num) : 0;
    const name = typeof gos === 'string' ? gos.trim().slice(0, 20) : '';
    const matches = target || name ? await database.entityData.findMany({
      where: { entityid: id, ...(target ? { id: target } : { title: name }) }, select: { id: true }, take: 50,
    }) : [];
    const [vehicles, last] = await Promise.all([
      Promise.all(matches.map(row => findVehicle(row.id))),
      database.entityRequest.findFirst({ where: recent(userId), select: { id: true } }),
    ]);
    return { labels, vehicles: vehicles.filter(Boolean), limited: !!last, siteKey: process.env.TURNSTILE_SITE_KEY ?? '' };
  }

  @Post(':model')
  @HttpCode(200)
  async submit(@Req() request: Request, @Param('model') value: string, @Body() body: Record<string, unknown>) {
    const { userId, id, labels } = await this.context(request, value);
    const rawBase = body?.base_nid;
    if (typeof rawBase !== 'string' || !/^\d{1,10}$/.test(rawBase) || Number(rawBase) > 2147483647 || !labels.length) {
      throw new BadRequestException();
    }
    const baseId = Number(rawBase);
    const entries = labels.map((_, index) => {
      const field = body['modelinput_' + (index + 1)];
      if (typeof field !== 'string' || !field.trim() || field.length > 21) throw new BadRequestException();
      return [index + 1, { value: field.trim() }] as const;
    });
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret || process.env.TURNSTILE_SITE_KEY) {
      if (!secret) throw new ServiceUnavailableException();
      const token = body['cf-turnstile-response'];
      if (typeof token !== 'string' || !token || token.length > 2048) throw new BadRequestException();
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (!response?.ok) throw new ServiceUnavailableException();
      if (!(await response.json())?.success) throw new BadRequestException();
    }
    await database.$transaction(async tx => {
      await tx.$queryRaw(Prisma.sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`);
      if (await tx.entityRequest.findFirst({ where: recent(userId) })) throw new ConflictException();
      const base = baseId ? await tx.entityData.findFirst({ where: { id: baseId, entityid: id } }) : null;
      if (baseId && !base) throw new BadRequestException();
      await tx.entityRequest.create({
        data: { user_id: userId, entityid: id, title: base?.title ?? entries[0][1].value,
          data: JSON.stringify(Object.fromEntries(entries)), created_at: timestamp(), status: 0 },
      });
    });
    return { errorcode: 0, error: 0 };
  }
}
