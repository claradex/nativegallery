import { BadRequestException, Body, Controller, Get, Header, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

@Controller('api/admin/entities')
export class AdminEntitiesController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request) {
    await this.auth.requireAdmin(request, 'editor');
    return database.entity.findMany({ select: { id: true, title: true }, orderBy: { id: 'desc' } });
  }

  @Post()
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.auth.requireAdmin(request, 'editor');
    const { title, color } = body ?? {};
    if (typeof title !== 'string' || !title.trim() || title.length > 255 ||
        typeof color !== 'string' || !/^#[a-f0-9]{6}$/i.test(color)) throw new BadRequestException();
    const sample: Record<string, { name: string; id: string; type: string; important: string }> = {};
    const ids = new Set<string>();
    for (const key of Object.keys(body)) {
      const index = key.match(/^variablename_([1-9]\d?)$/)?.[1];
      if (!index) continue;
      const name = body[key];
      const id = body['variableid_' + index];
      const type = body['variabletype_' + index];
      const important = body['variableimportant_' + index];
      if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
          typeof id !== 'string' || !id.trim() || id.length > 64 || ids.has(id.trim()) ||
          (type !== '1' && type !== '2') || (important !== '1' && important !== '2')) throw new BadRequestException();
      ids.add(id.trim());
      sample[index] = { name: name.trim(), id: id.trim(), type, important };
    }
    const sampledata = JSON.stringify(sample);
    if (!ids.size || Buffer.byteLength(sampledata) > 65535) throw new BadRequestException();
    return database.entity.create({
      data: { title: title.trim(), color, sampledata, createdate: BigInt(Math.floor(Date.now() / 1000)) },
      select: { id: true },
    });
  }
}
