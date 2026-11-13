import { All, Controller, ForbiddenException, Header, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

const success = '{"errorcode":0,"error":0}';

@Controller('api/admin/models/requests')
export class VehicleModerationController {
  constructor(private readonly auth: AuthService) {}

  @All(':id/:action')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'private, no-store')
  async decide(@Req() request: Request, @Param('id') value: string, @Param('action') action: string) {
    if (!(await this.auth.viewer(request))?.admin) throw new ForbiddenException();

    const id = Number(value);
    if (!/^\d+$/.test(value) || id < 1 || id > 2147483647 ||
        (action !== 'accept' && action !== 'decline')) return success;

    await database.$transaction(async tx => {
      const [pending] = await tx.$queryRaw<{ title: string; entityid: number; data: string }[]>(Prisma.sql`
        SELECT title, entityid, data FROM entities_requests WHERE id = ${id} AND status = 0 FOR UPDATE
      `);
      if (!pending) return;
      if (action === 'accept') {
        await tx.entityData.create({
          data: {
            title: pending.title, entityid: pending.entityid, content: pending.data,
            createdate: BigInt(Math.floor(Date.now() / 1000)),
          },
        });
      }
      await tx.entityRequest.update({ where: { id }, data: { status: action === 'accept' ? 1 : 2 } });
    });
    return success;
  }
}
