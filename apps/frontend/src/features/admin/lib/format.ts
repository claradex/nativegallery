const dateTime = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Moscow' });
const dateOnly = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeZone: 'Europe/Moscow' });

/** Unix seconds (as the database stores them) in Moscow time, which is how the site shows dates. */
export function formatDate(seconds: number | null | undefined, { time = true } = {}) {
  if (!seconds) return '—';
  return (time ? dateTime : dateOnly).format(seconds * 1000);
}

const short = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
const shortWithYear = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

/** A compact Moscow-time range for schedules: the year is shown only when it is not the current one. */
export function formatPeriod(from: number, to: number) {
  const year = new Date().getFullYear();
  const format = [from, to].every(seconds => new Date(seconds * 1000).getFullYear() === year) ? short : shortWithYear;
  return format.formatRange(from * 1000, Math.max(from, to) * 1000);
}

export function plural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10, mod100 = count % 100;
  const word = mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
  return count.toLocaleString('ru-RU') + ' ' + word;
}

/** Media served from the photo URL: uploads can be videos as well as pictures. */
export function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}
