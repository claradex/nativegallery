import { BadRequestException, Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function bound(value: unknown, fallback: number, limit: number) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Number(value))) throw new BadRequestException();
  return Math.max(-limit, Math.min(limit, Number(value)));
}

@Controller('api/photo/loadmap')
export class PhotoMapController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async load(@Req() request: Request, @Query() query: Record<string, unknown>) {
    if (!await this.auth.viewer(request)) throw new ForbiddenException();
    const north = bound(query.north, 90, 90);
    const south = bound(query.south, -90, 90);
    const west = bound(query.west, -180, 180);
    const east = bound(query.east, 180, 180);
    if (north < south) throw new BadRequestException();

    const longitude = west <= east ? Prisma.sql`lng BETWEEN ${west} AND ${east}`
      : Prisma.sql`(lng >= ${west} OR lng <= ${east})`;
    const rows = await database.$queryRaw<{ id: number; photourl: string; lat: number; lng: number }[]>(Prisma.sql`
      SELECT id, photourl, lat, lng FROM (
        SELECT id, photourl,
          CASE WHEN lat_text REGEXP '^-?[0-9]+([.][0-9]+)?$' THEN CAST(lat_text AS DECIMAL(16, 8)) END AS lat,
          CASE WHEN lng_text REGEXP '^-?[0-9]+([.][0-9]+)?$' THEN CAST(lng_text AS DECIMAL(16, 8)) END AS lng
        FROM (
          SELECT id, photourl,
            JSON_UNQUOTE(JSON_EXTRACT(CASE WHEN JSON_VALID(content) THEN content ELSE '{}' END, '$.lat')) AS lat_text,
            JSON_UNQUOTE(JSON_EXTRACT(CASE WHEN JSON_VALID(content) THEN content ELSE '{}' END, '$.lng')) AS lng_text
          FROM photos WHERE moderated = 1
        ) AS metadata
      ) AS coordinates
      WHERE lat BETWEEN ${south} AND ${north} AND lng BETWEEN -180 AND 180 AND ${longitude}
      ORDER BY id DESC LIMIT 100
    `);
    return rows.map(row => {
      const thumb = row.photourl.startsWith('/uploads/') ? '/api/photo/compress?url=' + encodeURIComponent(row.photourl) : row.photourl;
      return { ...row, lat: Number(row.lat), lng: Number(row.lng), thumb, photourl_small: thumb };
    });
  }
}
