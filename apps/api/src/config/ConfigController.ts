import { BadRequestException, Body, Controller, Get, Header, HttpCode, Put, Req, ServiceUnavailableException } from '@nestjs/common';
import type { Request } from 'express';
import { accessSync, constants } from 'node:fs';
import { dirname } from 'node:path';
import { configPath, configuredValue, fileValue, saveSettings } from '@nativegallery/config';
import { settingByKey, settingDefinitions, settingError, type ConfigOverview } from '@nativegallery/contracts';
import { AuthService } from '../auth/AuthService';

function writable(path: string) {
  for (const target of [path, dirname(path)]) {
    try { accessSync(target, constants.W_OK); return true; } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return false;
    }
  }
  return false;
}

function source(key: string): 'file' | 'environment' | 'default' {
  if (fileValue(key)) return 'file';
  return process.env[key] ? 'environment' : 'default';
}

/**
 * The site settings from .env for the admin panel («Конфигурация»). Owner only: the file holds the SMTP password and
 * the captcha secret, which are never sent back, only replaced.
 */
@Controller('api/admin/config')
export class ConfigController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async overview(@Req() request: Request): Promise<ConfigOverview> {
    await this.auth.requireAdmin(request, 'owner');
    const path = configPath();
    return {
      path, writable: writable(path),
      values: settingDefinitions.map(({ key, type }) => {
        const value = configuredValue(key);
        const set = value !== undefined && value !== '';
        return { key, value: type === 'secret' ? '' : value ?? '', set, source: source(key) };
      }),
    };
  }

  /** Saves the given keys. A secret left out (or sent empty while one is set) keeps its current value. */
  @Put()
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async save(@Req() request: Request, @Body() body: { values?: unknown; clear?: unknown }) {
    await this.auth.requireAdmin(request, 'owner');
    const values = body?.values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new BadRequestException();
    const clear = new Set(Array.isArray(body.clear) ? body.clear.filter((key): key is string => typeof key === 'string') : []);
    const errors: Record<string, string> = {};
    const changes: Record<string, string> = {};
    for (const [key, raw] of Object.entries(values)) {
      const definition = settingByKey.get(key);
      if (!definition || typeof raw !== 'string') throw new BadRequestException('Неизвестная настройка: ' + key);
      const value = definition.type === 'textarea' ? raw.replace(/\r\n?/g, '\n').trim() : raw.trim();
      if (definition.type === 'secret' && value === '') continue;
      const error = settingError(definition, value);
      if (error) errors[key] = error;
      else if (value !== (configuredValue(key) ?? '')) changes[key] = value;
    }
    for (const key of clear) {
      if (settingByKey.get(key)?.type !== 'secret') throw new BadRequestException('Неизвестная настройка: ' + key);
      if (configuredValue(key)) changes[key] = '';
    }
    if (Object.keys(errors).length) throw new BadRequestException({ message: 'Проверьте выделенные поля.', errors });
    if (!Object.keys(changes).length) return { changed: [] };
    try {
      saveSettings(changes);
    } catch {
      throw new ServiceUnavailableException('Не удалось записать ' + configPath() + ': файл недоступен для записи.');
    }
    return { changed: Object.keys(changes) };
  }
}
