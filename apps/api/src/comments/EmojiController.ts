import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

@Controller('api/emoji')
export class EmojiController {
  @Get('load')
  async load() {
    const root = process.env.EMOJI_ROOT ?? '../frontend/public/static/img/smileys';
    try {
      const directories = await readdir(root, { withFileTypes: true });
      const groups = await Promise.all(directories.filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name)).map(async ({ name: group }) => {
          const files = await readdir(join(root, group), { withFileTypes: true });
          return files.filter(entry => entry.isFile() && /^[\w-]+\.(gif|png|jpg|webp)$/.test(entry.name))
            .sort((a, b) => a.name.localeCompare(b.name)).map(({ name }) => {
              const label = name.slice(0, name.lastIndexOf('.'));
              return {
                code: ('[' + group + '/' + label + ']').replace(/[\[\]/-]/g, char => '\\' + char),
                url: '/static/img/smileys/' + group + '/' + name,
                keywords: ('[' + group + '_' + label + ']').split('_'),
              };
            });
        }));
      return { status: 'success', data: groups.flat() };
    } catch {
      throw new ServiceUnavailableException({ status: 'error', message: 'Smileys load failed' });
    }
  }
}
