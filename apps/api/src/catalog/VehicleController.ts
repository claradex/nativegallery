import { Controller, Get, Header, NotFoundException, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import type { VehiclePageData } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';
import { findVehicle } from './VehicleData';
import { requireId } from '../common/ids';

@Controller('api/internal')
export class VehicleController {
  constructor(private readonly auth: AuthService) {}

  @Get('vehicle-models')
  @Header('Cache-Control', 'private, no-store')
  async models(@Req() request: Request) {
    await this.auth.requireViewer(request);
    return database.entity.findMany({ select: { id: true, title: true, color: true }, orderBy: { id: 'asc' } });
  }

  @Get('vehicle/:id')
  @Header('Cache-Control', 'private, no-store')
  async getVehicle(@Param('id') rawId: string, @Req() request: Request): Promise<VehiclePageData> {
    await this.auth.requireViewer(request);
    const id = requireId(rawId);
    const vehicle = await findVehicle(id);
    if (!vehicle) throw new NotFoundException();

    type Photo = VehiclePageData['photos'][number];
    const rows = await database.$queryRaw<(Omit<Photo, 'views' | 'comments'> & { views: bigint; comments: bigint })[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, p.user_id AS authorId,
        COALESCE(u.username, '') AS author,
        (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views,
        (SELECT COUNT(*) FROM photos_comments c WHERE c.photo_id = p.id) AS comments
      FROM photos p LEFT JOIN users u ON u.id = p.user_id
      WHERE p.entitydata_id = ${id} AND p.moderated = 1 ORDER BY p.id
    `);
    return { vehicle, photos: rows.map(row => ({ ...row, views: Number(row.views), comments: Number(row.comments) })) };
  }
}
