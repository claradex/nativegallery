import { BadRequestException, Body, ConflictException, Controller, Get, Header, HttpCode, NotFoundException, Param, Post, Query, Req, ServiceUnavailableException } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { GeoKind } from '@nativegallery/contracts';
import { contentRecord, entityFields, fieldValue, geoTree } from './VehicleCatalog';
import { requireId } from '../common/ids';
import { setting } from '@nativegallery/config';

const timestamp = () => BigInt(Math.floor(Date.now() / 1000));
const recent = (user_id: number) => ({ user_id, created_at: { gt: timestamp() - 82800n } });

@Controller('api/vehicles/requests')
export class VehicleRequestController {
  constructor(private readonly auth: AuthService) {}

  private async context(request: Request, value: string) {
    const viewer = await this.auth.requireViewer(request);
    const id = requireId(value);
    const entity = await database.entity.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException();
    // Users describe the vehicle itself; model fields are the editors' business.
    const fields = entityFields(entity.sampledata).filter(field => field.scope === 'vehicle');
    return { userId: viewer.id, id, fields };
  }

  @Get(':model')
  @Header('Cache-Control', 'private, no-store')
  async form(@Req() request: Request, @Param('model') value: string, @Query('num') num?: string, @Query('gos') gos?: string) {
    const { userId, id, fields } = await this.context(request, value);
    const target = typeof num === 'string' && /^\d{1,10}$/.test(num) && Number(num) <= 2147483647 ? Number(num) : 0;
    const name = typeof gos === 'string' ? gos.trim().slice(0, 20) : '';
    const [matches, last, models, cities] = await Promise.all([
      target || name ? database.entityData.findMany({
        where: { entityid: id, ...(target ? { id: target } : { title: name }) },
        select: { id: true, title: true, content: true, model_id: true, city_id: true }, take: 50,
      }) : [],
      database.entityRequest.findFirst({ where: recent(userId), select: { id: true } }),
      database.entityModel.findMany({ where: { entityid: id }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      database.geoEntry.findMany({ where: { kind: GeoKind.City }, select: { id: true } }),
    ]);
    const geo = await geoTree(cities.map(city => city.id));
    return {
      fields: fields.map(({ key, name, required, type }) => ({ key, label: name, required, type })),
      models, cities: cities.map(city => geo.city(city.id)!).sort((a, b) => a.title.localeCompare(b.title, 'ru')),
      vehicles: matches.map(row => ({
        id: row.id, title: row.title, modelId: row.model_id, cityId: row.city_id,
        values: Object.fromEntries(fields.map(field => [field.key, fieldValue(contentRecord(row.content), field)])),
      })),
      limited: !!last, siteKey: setting('TURNSTILE_SITE_KEY'),
    };
  }

  @Post(':model')
  @HttpCode(200)
  async submit(@Req() request: Request, @Param('model') value: string, @Body() body: Record<string, unknown>) {
    const { userId, id, fields } = await this.context(request, value);
    const rawBase = body?.base_nid;
    if (typeof rawBase !== 'string' || !/^\d{1,10}$/.test(rawBase) || Number(rawBase) > 2147483647) {
      throw new BadRequestException();
    }
    const baseId = Number(rawBase);
    const number = typeof body.number === 'string' ? body.number.trim() : '';
    if (number.length > 64 || (!baseId && !number)) throw new BadRequestException();
    const entries = fields.map(field => {
      const input = body['modelinput_' + field.key] ?? '';
      if (typeof input !== 'string' || input.length > 1000 || (field.required && !input.trim())) throw new BadRequestException();
      return [field.key, { value: input.trim() }] as const;
    });
    const ref = (raw: unknown) => typeof raw === 'string' && /^\d{1,10}$/.test(raw) && Number(raw) > 0 && Number(raw) <= 2147483647 ? Number(raw) : null;
    const modelId = ref(body.model_id), cityId = ref(body.city_id);
    const [model, city] = await Promise.all([
      modelId ? database.entityModel.findFirst({ where: { id: modelId, entityid: id }, select: { id: true } }) : null,
      cityId ? database.geoEntry.findFirst({ where: { id: cityId, kind: GeoKind.City }, select: { id: true } }) : null,
    ]);
    if ((modelId && !model) || (cityId && !city)) throw new BadRequestException();
    const secret = setting('TURNSTILE_SECRET_KEY');
    if (secret || setting('TURNSTILE_SITE_KEY')) {
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
        data: { user_id: userId, entityid: id, title: number || base?.title || '',
          data: JSON.stringify(Object.fromEntries(entries)), created_at: timestamp(), status: 0, model_id: modelId, city_id: cityId },
      });
    });
    return { errorcode: 0, error: 0 };
  }
}
