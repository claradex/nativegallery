export function metadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
}

export const failure = '{"errorcode":"1","error":1}';
