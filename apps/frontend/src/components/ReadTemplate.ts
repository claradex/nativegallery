import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readTemplate(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8');
}
