import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';
import type { VehiclePageData } from '@nativegallery/contracts';
import { vehicleDetails } from './VehicleData';
import { requireId } from '../common/ids';

@Controller('api/internal')
export class VehicleController {
  /** Entity kinds for pickers (upload, vehicle requests, admin). */
  @Get('vehicle-models')
  @Header('Cache-Control', 'no-store')
  async models() {
    return database.entity.findMany({ select: { id: true, title: true, color: true }, orderBy: { id: 'asc' } });
  }

  /** `/vehicle/:id`: one concrete vehicle with its photos. Public, like transphoto. */
  @Get('vehicle/:id')
  @Header('Cache-Control', 'no-store')
  async getVehicle(@Param('id') rawId: string): Promise<VehiclePageData> {
    const id = requireId(rawId);
    const vehicle = await vehicleDetails(id);
    if (!vehicle) throw new NotFoundException();

    type Photo = VehiclePageData['photos'][number];
    const rows = await database.$queryRaw<(Omit<Photo, 'views' | 'comments'> & { views: bigint; comments: bigint })[]>(Prisma.sql`
      SELECT p.id, p.photourl, p.place, p.postbody, p.timeupload, p.user_id AS authorId,
        COALESCE(u.username, '') AS author,
        (SELECT COUNT(*) FROM photos_views v WHERE v.photo_id = p.id) AS views,
        (SELECT COUNT(*) FROM photos_comments c WHERE c.photo_id = p.id) AS comments
      FROM photos p LEFT JOIN users u ON u.id = p.user_id
      WHERE (p.entitydata_id = ${id} OR p.id IN (SELECT photo_id FROM photos_vehicles WHERE entitydata_id = ${id})) AND p.moderated = 1 ORDER BY p.posted_at DESC, p.id DESC
    `);
    return { vehicle, photos: rows.map(row => ({ ...row, views: Number(row.views), comments: Number(row.comments) })) };
  }
}
