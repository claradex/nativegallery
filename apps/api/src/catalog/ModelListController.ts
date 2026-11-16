import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';
import { activeStatuses, type EntityType, type ModelListData, type ModelListEntry } from '@nativegallery/contracts';
import { requireId } from '../common/ids';
import { modelYears } from './VehicleCatalog';

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
/** Latin names before Cyrillic ones, the way transphoto orders its lists. */
const cyrillic = /^\p{Script=Cyrillic}/u;
const latinFirst = (a: string, b: string) =>
  Number(cyrillic.test(a)) - Number(cyrillic.test(b)) || collator.compare(a, b);

const other = 'Прочие производители';

@Controller('api/internal/models')
export class ModelListController {
  /** Entity kinds with their model counts, for the `/models` index. */
  @Get()
  @Header('Cache-Control', 'no-store')
  async types(): Promise<(EntityType & { models: number })[]> {
    const [types, counts] = await Promise.all([
      database.entity.findMany({ select: { id: true, title: true }, orderBy: { id: 'asc' } }),
      database.entityModel.groupBy({ by: ['entityid'], _count: { _all: true } }),
    ]);
    return types.map(type => ({ ...type, models: counts.find(row => row.entityid === type.id)?._count._all ?? 0 }));
  }

  /** `/models?t=`: the models of one kind grouped by manufacturer, submodels under their parent. */
  @Get(':type')
  @Header('Cache-Control', 'no-store')
  async list(@Param('type') rawType: string): Promise<ModelListData> {
    const id = requireId(rawType);
    const type = await database.entity.findUnique({ where: { id }, select: { id: true, title: true, color: true } });
    if (!type) throw new NotFoundException();
    const [types, rows] = await Promise.all([
      this.types(),
      database.$queryRaw<{ id: number; title: string; manufacturer: string | null; parent_id: number | null;
        built_from: number | null; built_to: number | null; vehicles: bigint; active: bigint | null }[]>(Prisma.sql`
        SELECT m.id, m.title, m.manufacturer, m.parent_id, m.built_from, m.built_to,
          COUNT(v.id) AS vehicles, SUM(v.status IN (${Prisma.join(activeStatuses)})) AS active
        FROM entities_models m LEFT JOIN entities_data v ON v.model_id = m.id
        WHERE m.entityid = ${id} GROUP BY m.id
      `),
    ]);
    const entries = new Map(rows.map(row => [row.id, {
      entry: { id: row.id, title: row.title, years: modelYears(row.built_from, row.built_to), vehicles: Number(row.vehicles),
        active: Number(row.active ?? 0), children: [] } as ModelListEntry,
      row,
    }]));
    const groups = new Map<string, ModelListEntry[]>();
    for (const { entry, row } of entries.values()) {
      const parent = row.parent_id ? entries.get(row.parent_id) : undefined;
      if (parent) { parent.entry.children.push(entry); continue; }
      const title = row.manufacturer?.trim() || other;
      groups.set(title, [...groups.get(title) ?? [], entry]);
    }
    const sortTree = (list: ModelListEntry[]) => {
      list.sort((a, b) => latinFirst(a.title, b.title));
      list.forEach(entry => sortTree(entry.children));
      return list;
    };
    return {
      type, types,
      groups: [...groups].map(([title, models]) => ({ title, models: sortTree(models) }))
        .sort((a, b) => Number(a.title === other) - Number(b.title === other) || latinFirst(a.title, b.title)),
    };
  }
}
