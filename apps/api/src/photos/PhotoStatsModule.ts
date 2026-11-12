import { Controller, Get, Header, Module, NotFoundException, Query, StreamableFile } from '@nestjs/common';
import sharp from 'sharp';
import { database, Prisma } from '@nativegallery/database';

const day = 86400;
const width = 1000;
const height = 700;
const baseline = 630;

function graph(counts: number[], firstDay: number) {
  const max = Math.max(1, ...counts);
  const bars = counts.map((count, index) => {
    const x = 50 + index * 30;
    const y = baseline - Math.floor(count / max * 590);
    const date = new Date((firstDay + index * day) * 1000).toISOString().slice(0, 10);
    const label = date.split('-').reverse().join('.');
    return '<rect x="' + x + '" y="' + y + '" width="21" height="' + (baseline - y + 1) + '" fill="#1e90ff"/>' +
      '<text x="' + (x + 2) + '" y="' + (y - 10) + '" font-size="17">' + count + '</text>' +
      '<text transform="translate(' + (x + 15) + ' 700) rotate(-90)" font-size="13">' + label + '</text>';
  }).join('');

  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
    '<rect width="100%" height="100%" fill="#282828"/>' +
    '<g fill="#fff" font-family="TT Commons, sans-serif">' + bars + '</g>' +
    '<path d="M50 50V630H950" fill="none" stroke="#c8c8c8"/></svg>');
}

@Controller('api/photo')
class PhotoStatsController {
  @Get('stats')
  @Header('Cache-Control', 'public, max-age=60')
  async stats(@Query('id') value: unknown) {
    const id = Number(value);
    if (typeof value !== 'string' || !/^\d+$/.test(value) || id < 1 || id > 2147483647) {
      throw new NotFoundException();
    }
    const now = Math.floor(Date.now() / 1000);
    const today = Math.floor(now / day) * day;
    const first = today - 30 * day;
    const counts = await database.$transaction(async tx => {
      const photo = await tx.photo.findFirst({ where: { id, moderated: 1 }, select: { id: true } });
      if (!photo) throw new NotFoundException();

      const rows = await tx.$queryRaw<{ bucket: bigint; views: bigint }[]>(Prisma.sql`
        SELECT time DIV ${day} AS bucket, COUNT(*) AS views FROM photos_views
        WHERE photo_id = ${id} AND time >= ${now - 30 * day} AND time <= ${now}
        GROUP BY bucket
      `);
      const byDay = new Map(rows.map(row => [Number(row.bucket), Number(row.views)]));
      return Array.from({ length: 31 }, (_, offset) => byDay.get(first / day + offset) ?? 0);
    });
    return new StreamableFile(await sharp(graph(counts, first)).png().toBuffer(), { type: 'image/png' });
  }
}

@Module({ controllers: [PhotoStatsController] })
export class PhotoStatsModule {}
