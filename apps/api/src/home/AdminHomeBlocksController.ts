import { BadRequestException, Body, Controller, Get, Header, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database } from '@nativegallery/database';
import { homeBlockDefinitions, isHomeBlockVisibility, type HomeBlockSettings } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';
import { newsHtml } from '../news/NewsHtml';
import { homeBlocks, isHomeBlockKey, visibilityCodes } from './HomeBlocks';

/** «Главная страница» in the admin panel: who sees each home block, their order, headings and the custom block's HTML. */
@Controller('api/admin/home-blocks')
export class AdminHomeBlocksController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Req() request: Request): Promise<HomeBlockSettings[]> {
    await this.auth.requireAdmin(request, 'owner');
    return homeBlocks();
  }

  /**
   * Saves the whole layout at once: `blocks` is the list in display order, each `{ key, visibility, title?, body? }`.
   * Blocks left out keep their settings.
   */
  @Put()
  @Header('Cache-Control', 'private, no-store')
  async save(@Req() request: Request, @Body('blocks') input: unknown) {
    await this.auth.requireAdmin(request, 'owner');
    // The admin panel posts forms, so the list arrives as a JSON string; a JSON body carries it as is.
    let raw = input;
    if (typeof input === 'string') {
      try { raw = JSON.parse(input); } catch { throw new BadRequestException(); }
    }
    if (!Array.isArray(raw) || raw.length > homeBlockDefinitions.length) throw new BadRequestException();
    const seen = new Set<string>();
    const rows = raw.map((item: unknown, index) => {
      if (!item || typeof item !== 'object') throw new BadRequestException();
      const { key, visibility, title, body } = item as Record<string, unknown>;
      if (!isHomeBlockKey(key) || seen.has(key) || !isHomeBlockVisibility(visibility)) throw new BadRequestException();
      seen.add(key);
      if (title !== undefined && (typeof title !== 'string' || title.length > 255)) throw new BadRequestException('Заголовок — до 255 символов.');
      if (body !== undefined && (typeof body !== 'string' || Buffer.byteLength(body) > 256_000)) throw new BadRequestException('Слишком длинный HTML.');
      return {
        key, visibility: visibilityCodes[visibility], sort: index * 10,
        title: typeof title === 'string' && title.trim() ? title.trim() : null,
        body: key === 'custom' && typeof body === 'string' ? newsHtml(body).trim() || null : null,
      };
    });
    await database.$transaction(rows.map(({ key, ...data }) =>
      database.homeBlock.upsert({ where: { key }, create: { key, ...data }, update: data })));
    return { saved: rows.length };
  }
}
