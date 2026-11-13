import { database } from '@nativegallery/database';
import type { PhotoPageData } from '@nativegallery/contracts';

function records(source: string | null): unknown[] | Record<string, unknown> {
  if (!source) return {};
  try {
    const value: unknown = JSON.parse(source);
    if (value && typeof value === 'object') return value as Record<string, unknown>;
  } catch {}
  return {};
}

function field(value: unknown, key: string): string {
  if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) return '';
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
}

export async function photoVehicle(id: number): Promise<PhotoPageData['vehicle']> {
  if (id < 1) return null;
  const vehicle = await database.entityData.findUnique({
    where: { id }, select: { title: true, entityid: true, content: true },
  });
  if (!vehicle) return null;
  const model = await database.entity.findUnique({
    where: { id: vehicle.entityid }, select: { sampledata: true },
  });
  const values = records(vehicle.content) as Record<string, unknown>;
  const fields = Object.values(records(model?.sampledata ?? null)).flatMap((item, index) => {
    const label = field(item, 'name');
    return label ? [{ label, value: field(values[String(index + 1)], 'value') }] : [];
  });
  return { id, title: vehicle.title, fields };
}
