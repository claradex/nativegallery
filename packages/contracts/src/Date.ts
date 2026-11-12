const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function plural(value: number, forms: [string, string, string]) {
  const digit = value % 10;
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (digit === 1) return forms[0];
  return digit >= 2 && digit <= 4 ? forms[1] : forms[2];
}

export function legacyDate(timestamp: number, now = Math.floor(Date.now() / 1000)) {
  if (!timestamp) return '';
  const age = now - timestamp;
  if (age <= 1) return 'только что';
  if (age < 60) return age + ' секунд назад';
  if (age < 3600) {
    const minutes = Math.floor(age / 60);
    return minutes + ' ' + plural(minutes, ['минуту', 'минуты', 'минут']) + ' назад';
  }
  if (age < 86400) {
    const hours = Math.floor(age / 3600);
    return hours + ' ' + plural(hours, ['час', 'часа', 'часов']) + ' назад';
  }
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: process.env.SITE_TIMEZONE ?? 'Europe/Moscow',
    day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(timestamp * 1000).map(part => [part.type, part.value]));
  return parts.day + ' ' + months[Number(parts.month) - 1] + ' ' + parts.year + ' в ' + parts.hour + ':' + parts.minute;
}
