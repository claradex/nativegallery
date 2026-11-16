import { Controller, Get, Header, NotFoundException, Query, StreamableFile } from '@nestjs/common';
import sharp from 'sharp';
import { database, Prisma } from '@nativegallery/database';

const day = 86400;
const width = 1000;
const height = 700;
/** The plot area: bars stand on `bottom`, the tallest one reaches the top gridline. */
const plot = { left: 64, right: 966, top: 70, bottom: 610 };
const bar = '#1e90ff';
const font = 'font-family="TT Commons, DejaVu Sans, sans-serif"';

/** A round gridline step (1, 2, 5 × 10ⁿ) giving about four lines up to `max`. */
function tickStep(max: number) {
  const raw = Math.max(1, max / 4);
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(factor => factor * power).find(step => step >= raw) ?? raw;
}

function graph(counts: number[], firstDay: number) {
  const step = tickStep(Math.max(...counts));
  const top = Math.max(step, Math.ceil(Math.max(...counts) / step) * step);
  const scale = (plot.bottom - plot.top) / top;
  const slot = (plot.right - plot.left) / counts.length;
  const barWidth = Math.round(slot * 0.64);
  const total = counts.reduce((sum, count) => sum + count, 0);

  const grid: string[] = [];
  for (let value = 0; value <= top; value += step) {
    const y = Math.round(plot.bottom - value * scale) + 0.5;
    grid.push('<line x1="' + plot.left + '" x2="' + plot.right + '" y1="' + y + '" y2="' + y + '" stroke="' + (value ? '#3a3a3a' : '#777') + '"/>' +
      '<text x="' + (plot.left - 10) + '" y="' + (y + 5) + '" text-anchor="end" font-size="14" fill="#8a8a8a">' + value + '</text>');
  }

  const bars = counts.map((count, index) => {
    const center = plot.left + slot * (index + 0.5);
    const x = Math.round(center - barWidth / 2);
    const date = new Date((firstDay + index * 86400) * 1000).toISOString().slice(5, 10).split('-').reverse().join('.');
    const label = '<text transform="translate(' + (center + 5).toFixed(1) + ' ' + (plot.bottom + 12) + ') rotate(-90)" text-anchor="end" font-size="13" fill="'
      + (index === counts.length - 1 ? '#fff' : '#8a8a8a') + '">' + date + '</text>';
    if (!count) return label;
    const h = Math.max(2, Math.round(count * scale));
    const y = plot.bottom - h;
    const r = Math.min(4, barWidth / 2, h / 2);
    // Rounded top, square foot on the baseline.
    const shape = '<path d="M' + x + ' ' + plot.bottom + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + barWidth - r)
      + 'Q' + (x + barWidth) + ' ' + y + ' ' + (x + barWidth) + ' ' + (y + r) + 'V' + plot.bottom + 'Z" fill="' + bar + '"/>';
    return shape + '<text x="' + center.toFixed(1) + '" y="' + (y - 8) + '" text-anchor="middle" font-size="15" font-weight="bold" fill="#fff">' + count + '</text>' + label;
  }).join('');

  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
    '<rect width="100%" height="100%" fill="#282828"/>' +
    '<g ' + font + '>' +
    '<text x="' + plot.left + '" y="38" font-size="20" fill="#fff">Просмотры за 31 день</text>' +
    '<text x="' + plot.right + '" y="38" text-anchor="end" font-size="20" fill="#8a8a8a">всего: <tspan fill="#fff" font-weight="bold">' + total + '</tspan></text>' +
    grid.join('') + bars + '</g></svg>');
}

@Controller('api/photo')
export class PhotoStatsController {
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
