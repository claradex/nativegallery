export function idOf(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 0;
  const id = Number(value);
  return id <= 2147483647 ? id : 0;
}

export function metadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
}

export const failure = '{"errorcode":"1","error":1}';
