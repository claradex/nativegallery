import { Controller, ForbiddenException, Get, Header, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

interface VehicleMatch {
  id: number;
  title: string;
  comment: string | null;
  model: string | null;
}

function escapeHtml(text: string | null) {
  return (text ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
}

function resultRow(row: VehicleMatch) {
  return `<tbody class="found_vehicle s11" data-state="1" data-vid="${row.id}" data-cid="2" data-type="3" data-twoside="0">
    <tr><th width="100">ID</th><th width="90%">Название</th><th>Примечание</th><th class="c nw">Тип</th></tr>
    <tr>
      <td style="padding:10px"><a href="/vehicle/${row.id}" target="_blank" class="num pcnt">${row.id}</a></td>
      <td style="padding:10px; font-size:16px" class="mname">${escapeHtml(row.title)}</td>
      <td style="padding:10px" class="d">${escapeHtml(row.comment)}</td>
      <td style="padding:10px" class="d">${escapeHtml(row.model)}</td>
    </tr>
  </tbody>`;
}

@Controller('api/vehicles')
export class VehicleSearchController {
  constructor(private readonly auth: AuthService) {}

  @Get('load')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'private, no-store')
  async load(@Req() request: Request, @Query('type') type: unknown, @Query('num') num: unknown) {
    if (!await this.auth.viewer(request)) throw new ForbiddenException();
    if (typeof num !== 'string' && num !== undefined) return '<table></table>';
    const query = '%' + (num ?? '') + '%';
    const modelId = typeof type === 'string' && /^\d{1,10}$/.test(type) ? Number(type) : 0;
    const rows = await database.$queryRaw<VehicleMatch[]>(Prisma.sql`
      SELECT v.id, v.title, v.comment, m.title AS model
      FROM entities_data v LEFT JOIN entities m ON m.id = v.entityid
      WHERE LOWER(v.title) LIKE LOWER(${query})
        OR (CAST(v.id AS CHAR) LIKE ${query} AND v.entityid = ${modelId})
      ORDER BY v.id
    `);
    return '<table>' + rows.map(resultRow).join('') + '</table>';
  }
}
