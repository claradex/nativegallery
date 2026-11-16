import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';
import type { EntityType, ModelListData, ModelListEntry } from '@nativegallery/contracts';
import { requireId } from '../common/ids';

/** Field ids and names that mark the manufacturer of a model in an entity's `sampledata`. */
const makerField = /manufact|maker|builder|vendor|brand|factory|plant|производ|изготов|завод|марка/i;

/** Position (1-based, the key under which models store the value) of the entity's manufacturer field, or null. */
function makerIndex(sampledata: string) {
  try {
    const fields: unknown = JSON.parse(sampledata);
    if (!fields || typeof fields !== 'object') return null;
    const index = Object.values(fields as Record<string, { id?: unknown; name?: unknown } | null>)
      .findIndex(field => makerField.test(String(field?.id ?? '')) || makerField.test(String(field?.name ?? '')));
    return index < 0 ? null : String(index + 1);
  } catch {
    return null;
  }
}

function fieldValue(content: string | null, key: string) {
  try {
    const values: unknown = content ? JSON.parse(content) : null;
    const raw = values && typeof values === 'object' ? (values as Record<string, { value?: unknown } | null>)[key]?.value : null;
    return typeof raw === 'string' || typeof raw === 'number' ? String(raw).trim() : '';
  } catch {
    return '';
  }
}

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
/** Latin names before Cyrillic ones, the way transphoto orders its lists. */
const cyrillic = /^\p{Script=Cyrillic}/u;
const latinFirst = (a: string, b: string) =>
  Number(cyrillic.test(a)) - Number(cyrillic.test(b)) || collator.compare(a, b);

const other = 'Прочее';

@Controller('api/internal/models')
export class ModelListController {
  /** Entity types with their model counts, for the navbar and the `/models` index. */
  @Get()
  @Header('Cache-Control', 'no-store')
  async types(): Promise<(EntityType & { models: number })[]> {
    const [types, counts] = await Promise.all([
      database.entity.findMany({ select: { id: true, title: true }, orderBy: { id: 'asc' } }),
      database.entityData.groupBy({ by: ['entityid'], _count: { _all: true } }),
    ]);
    return types.map(type => ({ ...type, models: counts.find(row => row.entityid === type.id)?._count._all ?? 0 }));
  }

  @Get(':type')
  @Header('Cache-Control', 'no-store')
  async list(@Param('type') rawType: string): Promise<ModelListData> {
    const id = requireId(rawType);
    const type = await database.entity.findUnique({ where: { id }, select: { id: true, title: true, color: true, sampledata: true } });
    if (!type) throw new NotFoundException();
    const [types, rows] = await Promise.all([
      this.types(),
      database.$queryRaw<(Omit<ModelListEntry, 'photos'> & { content: string | null; photos: bigint })[]>(Prisma.sql`
        SELECT d.id, d.title, d.comment, d.content,
          (SELECT COUNT(*) FROM photos p WHERE p.entitydata_id = d.id AND p.moderated = 1) AS photos
        FROM entities_data d WHERE d.entityid = ${id}
      `),
    ]);
    const maker = makerIndex(type.sampledata);
    const groups = new Map<string, ModelListEntry[]>();
    for (const { content, photos, ...model } of rows) {
      const title = maker ? fieldValue(content, maker) || other : '';
      groups.set(title, [...groups.get(title) ?? [], { ...model, photos: Number(photos) }]);
    }
    const { sampledata: _, ...summary } = type;
    return {
      type: summary, types,
      groups: [...groups].map(([title, models]) => ({ title, models: models.sort((a, b) => latinFirst(a.title, b.title)) }))
        .sort((a, b) => Number(a.title === other) - Number(b.title === other) || latinFirst(a.title, b.title)),
    };
  }
}
