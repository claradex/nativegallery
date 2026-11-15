import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { settingByKey, type SettingKey } from '@nativegallery/contracts';

/**
 * Site settings from the root .env file, re-read when the file changes, so edits from the admin panel apply to every
 * service without a restart. A value in the file wins over the process environment (which docker compose fills from
 * the same file at start), and an empty or missing value falls back to the default from the settings registry.
 * Services start in apps/<name>, so the file is ../../.env unless CONFIG_FILE says otherwise.
 */
export function configPath() {
  return process.env.CONFIG_FILE || resolve(process.cwd(), '../../.env');
}

interface Entry { value: string; start: number; end: number }
interface Parsed { lines: string[]; entries: Map<string, Entry> }

const keyPattern = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

function unescape(value: string) {
  return value.replace(/\\([nrt"\\])/g, (_, char: string) => ({ n: '\n', r: '\r', t: '\t' } as Record<string, string>)[char] ?? char);
}

/** dotenv syntax: KEY=value, optional `export`, # comments, '…' literals and "…" with escapes (may span lines). */
export function parseEnv(text: string): Parsed {
  const lines = text.split(/\r?\n/);
  const entries = new Map<string, Entry>();
  for (let index = 0; index < lines.length; index++) {
    const match = keyPattern.exec(lines[index]);
    if (!match) continue;
    const [, key, rest] = match;
    const start = index;
    let value: string;
    const quote = rest[0];
    if (quote === '"' || quote === "'") {
      let body = rest.slice(1);
      let close = closing(body, quote);
      while (close < 0 && quote === '"' && index + 1 < lines.length) {
        body += '\n' + lines[++index];
        close = closing(body, quote);
      }
      if (close < 0) close = body.length;
      value = quote === '"' ? unescape(body.slice(0, close)) : body.slice(0, close);
    } else {
      value = rest.replace(/(?:^|\s+)#.*$/, '').trim();
    }
    entries.set(key, { value, start, end: index });
  }
  return { lines, entries };
}

function closing(body: string, quote: string) {
  for (let at = 0; at < body.length; at++) {
    if (quote === '"' && body[at] === '\\') { at++; continue; }
    if (body[at] === quote) return at;
  }
  return -1;
}

/** Plain values stay bare; anything with spaces, quotes, # or line breaks is written as an escaped "…" string. */
export function formatEnvValue(value: string) {
  if (/^[A-Za-z0-9_./:@,+\-]*$/.test(value)) return value;
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
}

let cache: { path: string; mtime: number; size: number; checked: number; parsed: Parsed } | null = null;

function load(): Parsed {
  const path = configPath();
  const now = Date.now();
  if (cache && cache.path === path && now - cache.checked < 1000) return cache.parsed;
  let stat;
  try { stat = statSync(path); } catch { stat = null; }
  if (!stat || !stat.isFile()) {
    cache = { path, mtime: 0, size: -1, checked: now, parsed: { lines: [], entries: new Map() } };
    return cache.parsed;
  }
  if (cache && cache.path === path && cache.mtime === stat.mtimeMs && cache.size === stat.size) {
    cache.checked = now;
    return cache.parsed;
  }
  let parsed: Parsed;
  try { parsed = parseEnv(readFileSync(path, 'utf8')); } catch { parsed = cache?.parsed ?? { lines: [], entries: new Map() }; }
  cache = { path, mtime: stat.mtimeMs, size: stat.size, checked: now, parsed };
  return parsed;
}

/** The value as configured (file, then environment), or undefined when neither sets it. */
export function configuredValue(key: string): string | undefined {
  return load().entries.get(key)?.value ?? process.env[key];
}

/** The effective value of a setting: configured, or the registry default when empty. */
export function setting(key: SettingKey): string {
  const value = configuredValue(key);
  return value === undefined || value === '' ? settingByKey.get(key)?.default ?? '' : value;
}

export function flag(key: SettingKey): boolean {
  return setting(key) === 'true';
}

export function numberSetting(key: SettingKey): number {
  const value = Number(setting(key));
  return Number.isFinite(value) ? value : Number(settingByKey.get(key)?.default ?? 0);
}

/**
 * Sets keys in the .env file: lines of existing keys are replaced where they are, new keys go to the end, comments and
 * everything else stay as they were. Written in place (not via rename), because in docker the file is a bind mount.
 */
export function saveSettings(changes: Record<string, string>) {
  const path = configPath();
  let text = '';
  try { text = readFileSync(path, 'utf8'); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const { lines, entries } = parseEnv(text);
  const output = [...lines];
  const appended: string[] = [];
  // Replace from the bottom up, so the line numbers of the entries above stay valid.
  const updates = Object.entries(changes).map(([key, value]) => ({ key, line: key + '=' + formatEnvValue(value), entry: entries.get(key) }));
  for (const update of updates.filter(item => item.entry).sort((a, b) => b.entry!.start - a.entry!.start)) {
    output.splice(update.entry!.start, update.entry!.end - update.entry!.start + 1, update.line);
  }
  for (const update of updates) if (!update.entry) appended.push(update.line);
  while (appended.length && output.length && output[output.length - 1] === '') output.pop();
  const result = [...output, ...appended].join('\n').replace(/\n*$/, '\n');
  writeFileSync(path, result, { encoding: 'utf8' });
  cache = null;
}
