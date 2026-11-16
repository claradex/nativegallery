import { database } from '@nativegallery/database';
import {
  defaultVisibility, homeBlockDefinitions, type HomeBlockKey, type HomeBlockSettings, type HomeBlockVisibility,
} from '@nativegallery/contracts';

/** `ng_home_blocks.visibility` ↔ the contract's names. */
export const visibilityCodes: Record<HomeBlockVisibility, number> = { all: 0, users: 1, none: 2 };
const visibilityNames = Object.fromEntries(Object.entries(visibilityCodes).map(([name, code]) => [code, name])) as
  Record<number, HomeBlockVisibility>;

/** Every block with its stored settings over the defaults, ordered by column position. */
export async function homeBlocks(): Promise<HomeBlockSettings[]> {
  const rows = new Map((await database.homeBlock.findMany()).map(row => [row.key, row]));
  return homeBlockDefinitions.map((definition, index) => {
    const row = rows.get(definition.key);
    const customTitle = row?.title?.trim() ?? '';
    return {
      key: definition.key,
      column: definition.column,
      visibility: row ? visibilityNames[row.visibility] ?? 'all' : defaultVisibility(definition.key),
      sort: row?.sort ?? index * 10,
      customTitle,
      title: customTitle || definition.title,
      defaultTitle: definition.title,
      description: definition.description,
      body: definition.key === 'custom' ? row?.body ?? '' : '',
    };
  }).sort((a, b) => a.sort - b.sort);
}

/** Whether a block is shown to a guest (`signedIn` false) or a signed-in visitor. */
export const blockVisible = (block: { visibility: HomeBlockVisibility }, signedIn: boolean) =>
  block.visibility === 'all' || (block.visibility === 'users' && signedIn);

export const isHomeBlockKey = (value: unknown): value is HomeBlockKey =>
  homeBlockDefinitions.some(block => block.key === value);
