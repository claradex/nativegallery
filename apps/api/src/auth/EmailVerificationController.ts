import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { database } from '@nativegallery/database';

function accountId(content: string) {
  try {
    const id = Number(JSON.parse(content)?.user_id);
    if (Number.isInteger(id) && id > 0 && id <= 2147483647) return id;
  } catch {}
  return null;
}

@Controller('api/users/emailverify')
export class EmailVerificationController {
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @Header('Referrer-Policy', 'no-referrer')
  async verify(@Query('token') token: unknown, @Res() response: Response) {
    if (typeof token !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(token)) {
      response.status(404).end();
      return;
    }
    const confirmed = await database.$transaction(async tx => {
      const key = await tx.serviceKey.findFirst({
        where: { token, type: 'EMAILVERIFY', status: 1 }, orderBy: { id: 'asc' },
      });
      if (!key) return false;
      const userId = accountId(key.content);
      if (!userId) return false;
      const user = await tx.user.findUnique({ where: { id: userId }, select: { status: true } });
      if (!user || (user.status !== 0 && user.status !== 3)) return false;
      const claimed = await tx.serviceKey.updateMany({ where: { id: key.id, status: 1 }, data: { status: 0 } });
      if (!claimed.count) return false;
      const result = await tx.user.updateMany({ where: { id: userId, status: { in: [0, 3] } }, data: { status: 0 } });
      return result.count === 1;
    });
    if (!confirmed) response.status(404).end();
    else response.redirect(303, '/email-verified');
  }
}
