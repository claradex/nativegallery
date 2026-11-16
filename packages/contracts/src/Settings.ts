/**
 * Site settings that live in the root .env file and can be edited from the admin panel ("Конфигурация").
 * Services read them through @nativegallery/config, which re-reads the file when it changes, so an edit applies
 * without a restart unless the entry says `restart: true`.
 *
 * Infrastructure variables (DATABASE_URL, API_PORT, MEDIA_ROOT, API_ORIGIN, FFMPEG_PATH, EMOJI_ROOT, SITE_REVISION)
 * are not listed here: they are set per container and only read from the environment.
 * `legacy` names the key of the old ngallery.yaml that the setting replaces.
 */
export type SettingType = 'text' | 'textarea' | 'boolean' | 'number' | 'secret' | 'url' | 'email' | 'duration';

export interface SettingDefinition {
  key: string;
  group: SettingGroup;
  label: string;
  description?: string;
  type: SettingType;
  default: string;
  legacy?: string;
  /** Read once at startup (or baked into pages), so a change needs the containers restarted. */
  restart?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export const settingGroups = [
  { id: 'site', title: 'Сайт', description: 'Название, оформление и адрес сайта.' },
  { id: 'registration', title: 'Регистрация', description: 'Кто и как может зарегистрироваться.' },
  { id: 'photos', title: 'Фотографии', description: 'Загрузка и модерация снимков.' },
  { id: 'storage', title: 'Внешние хранилища', description: 'Плановая проверка копий фотографий и видео во внешних хранилищах.' },
  { id: 'contests', title: 'Фотоконкурсы', description: 'Проведение конкурсов и автоматический запуск новых.' },
  { id: 'mail', title: 'Почта', description: 'SMTP-сервер для писем с подтверждением регистрации.' },
  { id: 'security', title: 'Защита', description: 'Капча и параметры cookie.' },
] as const;

export type SettingGroup = typeof settingGroups[number]['id'];

const durationHint = 'Число и единица: s — секунды, m — минуты, h — часы, d — дни, w — недели, M — месяцы, y — годы. Например 2d.';

export const settingDefinitions = [
  { key: 'SITE_TITLE', group: 'site', label: 'Название сайта', type: 'text', default: 'NativeGallery', legacy: 'site.title' },
  { key: 'SITE_SHOW_TITLE', group: 'site', label: 'Показывать название рядом с логотипом', type: 'boolean', default: 'true', legacy: 'site.showtitle' },
  { key: 'SITE_LOGO', group: 'site', label: 'Логотип', description: 'Адрес картинки в шапке сайта.', type: 'text', default: '/static/img/logosmall.png', legacy: 'site.logo' },
  { key: 'SITE_DESCRIPTION', group: 'site', label: 'Описание', description: 'Текст на странице «О сервере» и в описании для поисковиков.', type: 'textarea', default: '', legacy: 'site.description' },
  { key: 'SITE_KEYWORDS', group: 'site', label: 'Ключевые слова', description: 'Через запятую, для тега keywords.', type: 'text', default: '', legacy: 'site.keywords' },
  { key: 'SITE_FOOTER_SLOGAN', group: 'site', label: 'Подпись в подвале', type: 'text', default: 'Aloha, Hawaii!', legacy: 'site.footerslogan' },
  { key: 'SITE_ADMIN_EMAIL', group: 'site', label: 'Почта администрации', description: 'Показывается на странице «О сервере» для связи.', type: 'email', default: '', legacy: 'site.adminemail' },
  { key: 'SITE_NAVBAR_LINKS', group: 'site', label: 'Дополнительные пункты меню', description: 'По одному на строку: «Название | /адрес». Добавляются в конец главного меню.', type: 'textarea', default: '', legacy: 'navbar', placeholder: 'Форум | https://forum.example.com' },
  { key: 'SITE_ORIGIN', group: 'site', label: 'Адрес сайта', description: 'Например https://example.com. Нужен для ссылок в письмах, RSS и robots.txt.', type: 'url', default: '' },
  { key: 'SITE_TIMEZONE', group: 'site', label: 'Часовой пояс', description: 'Название из базы IANA, например Europe/Moscow.', type: 'text', default: 'Europe/Moscow', restart: true },
  { key: 'MAINTENANCE', group: 'site', label: 'Технические работы', description: 'Вместо страниц сайта показывается заглушка о технических работах. Панель управления остаётся доступной.', type: 'boolean', default: 'false', legacy: 'site.maintenance' },

  { key: 'REGISTRATION_PUBLIC', group: 'registration', label: 'Открытая регистрация', type: 'boolean', default: 'false', legacy: 'registration.access.public' },
  { key: 'EMAIL_VERIFY', group: 'registration', label: 'Подтверждение почты', description: 'Новые пользователи подтверждают адрес по ссылке из письма. Нужны настройки почты.', type: 'boolean', default: 'false', legacy: 'registration.emailverify' },
  { key: 'REGISTRATION_PROHIBITED_USERNAMES', group: 'registration', label: 'Запрещённые никнеймы', description: 'Через запятую.', type: 'text', default: '', legacy: 'registration.prohibited_usernames' },
  { key: 'UPLOAD_INDEX_DEFAULT', group: 'registration', label: 'Индекс загрузки новых пользователей', type: 'number', default: '5', min: 0, max: 1000, legacy: 'photo.upload.defaultindex' },

  { key: 'PHOTO_PREMODERATION', group: 'photos', label: 'Премодерация', description: 'Новые фотографии появляются на сайте после проверки модератором.', type: 'boolean', default: 'true', legacy: 'photo.upload.premoderation' },
  { key: 'PHOTO_ALLOW_GIF', group: 'photos', label: 'Разрешить GIF', type: 'boolean', default: 'true', legacy: 'photo.upload.allowgif' },
  { key: 'UPLOAD_INDEX_ENABLED', group: 'photos', label: 'Индекс загрузки', description: 'Показывать пользователям их индекс загрузки в личном кабинете.', type: 'boolean', default: 'false', legacy: 'photo.uploadindex.enabled' },

  { key: 'STORAGE_VERIFY_EVERY', group: 'storage', label: 'Проверять хранилища', description: 'Как часто сверять опубликованные файлы с оригиналами. off — не проверять по расписанию. ' + durationHint, type: 'duration', default: '1d' },
  { key: 'STORAGE_VERIFY_DEEP', group: 'storage', label: 'Глубокая проверка по расписанию', description: 'Скачивать файлы и сравнивать SHA-256, а не только наличие и размер (и контрольную сумму, если хранилище её отдаёт). Медленно и расходует трафик.', type: 'boolean', default: 'false' },
  { key: 'STORAGE_VERIFY_REPAIR', group: 'storage', label: 'Исправлять найденные проблемы', description: 'После проверки заново публиковать пропавшие и повреждённые файлы, а также фотографии, загруженные после подключения хранилища, но не попавшие в него.', type: 'boolean', default: 'true' },

  { key: 'CONTESTS_ENABLED', group: 'contests', label: 'Фотоконкурсы', description: 'Разрешает фоновую задачу, которая переводит конкурсы между этапами.', type: 'boolean', default: 'false', legacy: 'contests.enabled' },
  { key: 'CONTESTS_AUTONEW', group: 'contests', label: 'Запускать новый конкурс автоматически', description: 'После подведения итогов создаётся конкурс на случайную активную тему.', type: 'boolean', default: 'false', legacy: 'contests.autonew.enabled' },
  { key: 'CONTESTS_AUTONEW_PRETENDS_OPEN', group: 'contests', label: 'Начало приёма работ', description: 'now — сразу, или через сколько после итогов. ' + durationHint, type: 'duration', default: 'now', legacy: 'contests.autonew.times.pretendsopen' },
  { key: 'CONTESTS_AUTONEW_PRETENDS_CLOSE', group: 'contests', label: 'Конец приёма работ', description: 'Через сколько после итогов. ' + durationHint, type: 'duration', default: '2d', legacy: 'contests.autonew.times.pretendsclose' },
  { key: 'CONTESTS_AUTONEW_OPEN', group: 'contests', label: 'Начало голосования', description: 'now — сразу после приёма работ, или через сколько после итогов.', type: 'duration', default: 'now', legacy: 'contests.autonew.times.open' },
  { key: 'CONTESTS_AUTONEW_CLOSE', group: 'contests', label: 'Конец голосования', description: 'Через сколько после итогов.', type: 'duration', default: '2d', legacy: 'contests.autonew.times.close' },

  { key: 'SMTP_HOST', group: 'mail', label: 'SMTP-сервер', type: 'text', default: '', legacy: 'email.credentials.host', placeholder: 'smtp.example.com' },
  { key: 'SMTP_PORT', group: 'mail', label: 'Порт', description: '465 — SSL, 587 — STARTTLS.', type: 'number', default: '465', min: 1, max: 65535, legacy: 'email.credentials.port' },
  { key: 'SMTP_USER', group: 'mail', label: 'Логин', type: 'text', default: '', legacy: 'email.credentials.username' },
  { key: 'SMTP_PASSWORD', group: 'mail', label: 'Пароль', type: 'secret', default: '', legacy: 'email.credentials.password' },
  { key: 'SMTP_FROM', group: 'mail', label: 'Адрес отправителя', type: 'email', default: '', legacy: 'email.from.address', placeholder: 'noreply@example.com' },

  { key: 'TURNSTILE_SITE_KEY', group: 'security', label: 'Cloudflare Turnstile: ключ сайта', description: 'Капча в заявках на добавление моделей. Пусто — без капчи.', type: 'text', default: '', legacy: 'security.cloudflareturnstile-keys.client' },
  { key: 'TURNSTILE_SECRET_KEY', group: 'security', label: 'Cloudflare Turnstile: секретный ключ', type: 'secret', default: '', legacy: 'security.cloudflareturnstile-keys.server' },
  { key: 'COOKIE_SECURE', group: 'security', label: 'Cookie только по HTTPS', description: 'Включайте, когда сайт открывается по https://.', type: 'boolean', default: 'false' },
] as const satisfies readonly SettingDefinition[];

export type SettingKey = typeof settingDefinitions[number]['key'];

export const settingByKey: ReadonlyMap<string, SettingDefinition> = new Map(settingDefinitions.map(entry => [entry.key, entry]));

const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, M: 2592000, y: 31536000 };

/** Seconds in a duration such as "30m" or "2d" (the legacy Date::addTime format); null when it does not parse. */
export function durationSeconds(value: string): number | null {
  const match = /^(\d{1,6})([smhdwMy])$/.exec(value.trim());
  return match ? Number(match[1]) * units[match[2]] : null;
}

/** Checks a value for a setting; returns a message in Russian, or null when it is fine. Empty means "the default". */
export function settingError(definition: SettingDefinition, value: string): string | null {
  if (value.length > 4000) return 'Слишком длинное значение.';
  if (definition.type !== 'textarea' && /[\r\n]/.test(value)) return 'Значение должно быть одной строкой.';
  if (value === '') return null;
  switch (definition.type) {
    case 'boolean': return value === 'true' || value === 'false' ? null : 'Ожидается true или false.';
    case 'number': {
      const number = Number(value);
      if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(number)) return 'Ожидается целое число.';
      if (definition.min !== undefined && number < definition.min) return 'Не меньше ' + definition.min + '.';
      if (definition.max !== undefined && number > definition.max) return 'Не больше ' + definition.max + '.';
      return null;
    }
    case 'url': {
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? null : 'Адрес должен начинаться с http:// или https://.';
      } catch { return 'Некорректный адрес.'; }
    }
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Некорректный адрес почты.';
    case 'duration': {
      // Only the two "start" moments may be "now"; the ends are always measured from the moment the contest closes.
      const nowAllowed = definition.key === 'CONTESTS_AUTONEW_PRETENDS_OPEN' || definition.key === 'CONTESTS_AUTONEW_OPEN';
      if (value === 'off' && definition.key === 'STORAGE_VERIFY_EVERY') return null;
      if (value === 'now') return nowAllowed ? null : 'Укажите срок, например 2d.';
      return durationSeconds(value) !== null ? null : 'Например 2d, 12h или 30m.';
    }
    default: return null;
  }
}

/** Extra main-menu entries from SITE_NAVBAR_LINKS ("Name | /link" per line). */
export function navbarLinks(value: string) {
  return value.split('\n').flatMap(line => {
    const at = line.lastIndexOf('|');
    if (at < 0) return [];
    const label = line.slice(0, at).trim();
    const href = line.slice(at + 1).trim();
    return label && /^(?:\/(?!\/)|https?:\/\/)/.test(href) ? [{ label, href }] : [];
  });
}

/** GET /api/admin/config: secrets come back empty, with `set` telling whether one is configured. */
export interface ConfigValue {
  key: string;
  value: string;
  set: boolean;
  /** Where the value comes from: the .env file, the process environment, or the registry default. */
  source: 'file' | 'environment' | 'default';
}

export interface ConfigOverview {
  path: string;
  writable: boolean;
  values: ConfigValue[];
}
