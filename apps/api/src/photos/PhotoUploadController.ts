import { Body, Controller, Get, Header, HttpCode, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';
import { GeoKind, type UploadOptionsData, type UploadVehicleMatch } from '@nativegallery/contracts';
import { photoContent } from './PhotoContent';
import { uploadPhoto } from './PhotoUpload';
import { flag } from '@nativegallery/config';
import { geoTree, vehicleColumns, vehicleSummaries, type VehicleRow } from '../catalog/VehicleCatalog';

@Controller('api/upload')
export class PhotoUploadController {
  constructor(private readonly auth: AuthService) {}

  @Get('options')
  @Header('Cache-Control', 'private, no-store')
  async options(@Req() request: Request): Promise<UploadOptionsData> {
    const viewer = await this.auth.requireViewer(request);
    const [galleries, entities, user, cities] = await Promise.all([
      database.gallery.findMany({ where: { opened: 1 }, orderBy: { id: 'asc' }, select: { id: true, title: true } }),
      database.entity.findMany({ orderBy: { id: 'asc' }, select: { id: true, title: true, color: true } }),
      database.user.findUniqueOrThrow({ where: { id: viewer.id }, select: { uploadindex: true, content: true } }),
      database.geoEntry.findMany({ where: { kind: GeoKind.City }, select: { id: true } }),
    ]);
    const geo = await geoTree(cities.map(city => city.id));
    return { galleries, entities, username: viewer.username, uploadIndex: user.uploadindex,
      cities: cities.flatMap(city => geo.city(city.id) ?? []).sort((a, b) => a.title.localeCompare(b.title, 'ru')),
      directUpload: flag('PHOTO_PREMODERATION') && photoContent(user.content).premoderation === 'true' };
  }

  /**
   * Vehicles of one kind by board number, for the upload form: exact numbers first, then numbers that start with
   * the query. `city` narrows the search to one city.
   */
  @Get('entities')
  @Header('Cache-Control', 'private, no-store')
  async entities(@Req() request: Request, @Query() query: Record<string, unknown>): Promise<UploadVehicleMatch[]> {
    await this.auth.requireViewer(request);
    const id = (value: unknown) => typeof value === 'string' && /^\d{1,10}$/.test(value) && Number(value) <= 2147483647 ? Number(value) : null;
    const entityid = id(query.type), city = id(query.city);
    const number = typeof query.q === 'string' ? query.q.trim() : '';
    if (!entityid || !number || number.length > 64) return [];
    const like = number.replace(/[\\%_]/g, char => '\\' + char) + '%';
    const rows = await database.$queryRaw<VehicleRow[]>(Prisma.sql`
      SELECT ${vehicleColumns} FROM entities_data v
      WHERE v.entityid = ${entityid} AND v.title LIKE ${like} ${city ? Prisma.sql`AND v.city_id = ${city}` : Prisma.empty}
      ORDER BY v.title = ${number} DESC, CHAR_LENGTH(v.title), v.title, v.status = 1 DESC, v.id DESC
      LIMIT 30
    `);
    return (await vehicleSummaries(rows)).map(vehicle => ({
      id: vehicle.id, number: vehicle.number, entityId: entityid, model: vehicle.model, city: vehicle.city, depot: vehicle.depot,
      built: vehicle.built, retired: vehicle.retired, status: vehicle.status, note: vehicle.note,
    }));
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 32 * 1024 * 1024, fields: 128, fieldSize: 65535 } }))
  async upload(@Req() request: Request, @Body() body: Record<string, unknown>, @UploadedFile() file?: { buffer: Buffer }) {
    const viewer = await this.auth.requireViewer(request);
    return uploadPhoto(viewer.id, body ?? {}, file?.buffer);
  }
}
