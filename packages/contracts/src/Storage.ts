/**
 * External storages photos and videos are published to (a second disk, Google Drive, S3-compatible buckets, WebDAV),
 * managed from the admin panel («Хранилища»). Each uploaded file gets a replica row per storage that records whether
 * it was published and what the last check found.
 */
export const storageKinds = ['disk', 'gdrive', 's3', 'webdav'] as const;
export type StorageKind = typeof storageKinds[number];

export type StorageFieldType = 'text' | 'secret' | 'textarea' | 'boolean' | 'url';

export interface StorageField {
  key: string;
  label: string;
  type: StorageFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  /** Filled in by the server (the connected Google account), not typed in the form. */
  readOnly?: boolean;
}

export interface StorageKindDefinition {
  id: StorageKind;
  label: string;
  description: string;
  fields: readonly StorageField[];
}

const prefixField: StorageField = {
  key: 'prefix', label: 'Папка внутри хранилища', type: 'text', placeholder: 'nativegallery',
  description: 'Файлы кладутся в эту папку с теми же путями, что и в uploads (cdn/img/…, cdn/video/…). Пусто — в корень.',
};

export const storageKindDefinitions: readonly StorageKindDefinition[] = [
  {
    id: 'disk', label: 'Другой диск', description: 'Папка на сервере: второй диск, NAS по NFS/SMB или любая примонтированная файловая система.',
    fields: [
      { key: 'path', label: 'Путь к папке', type: 'text', required: true, placeholder: '/mnt/backup/nativegallery',
        description: 'Абсолютный путь. В docker папку нужно примонтировать в контейнеры api и media-worker.' },
    ],
  },
  {
    id: 'gdrive', label: 'Google Drive', description: 'Google Drive обычного аккаунта Google (вход через Google) или сервисного аккаунта.',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '123456789-….apps.googleusercontent.com',
        description: 'OAuth-клиент типа «Веб-приложение» из Google Cloud Console (APIs & Services → Credentials) с включённым Google Drive API.' },
      { key: 'clientSecret', label: 'Client secret', type: 'secret' },
      { key: 'account', label: 'Аккаунт Google', type: 'text', readOnly: true },
      { key: 'refreshToken', label: 'Refresh token', type: 'secret', readOnly: true },
      { key: 'folderId', label: 'ID папки', type: 'text', placeholder: 'Пусто — создать папку NativeGallery',
        description: 'Пусто — при входе через Google в «Моём диске» создаётся папка NativeGallery, и сайт получает доступ только к своим файлам. ' +
          'ID своей папки (drive.google.com/drive/folders/<ID>) потребует полного доступа к Диску.' },
      { key: 'serviceAccount', label: 'Ключ сервисного аккаунта (JSON)', type: 'secret',
        description: 'Вместо входа через Google. У сервисных аккаунтов нет своего места — нужен ID папки на общем диске (Shared drive), открытой аккаунту на редактирование.' },
    ],
  },
  {
    id: 's3', label: 'S3', description: 'Amazon S3 и совместимые: Cloudflare R2, Yandex Object Storage, MinIO, Backblaze B2, Selectel.',
    fields: [
      { key: 'endpoint', label: 'Endpoint', type: 'url', placeholder: 'https://storage.yandexcloud.net',
        description: 'Пусто — Amazon S3 в выбранном регионе. Для R2: https://<account>.r2.cloudflarestorage.com.' },
      { key: 'region', label: 'Регион', type: 'text', placeholder: 'us-east-1', description: 'Для R2 — auto.' },
      { key: 'bucket', label: 'Бакет', type: 'text', required: true },
      { key: 'accessKeyId', label: 'Access key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret access key', type: 'secret', required: true },
      { key: 'pathStyle', label: 'Адреса вида endpoint/bucket', type: 'boolean',
        description: 'Включите для MinIO и других серверов без поддоменов бакетов.' },
      prefixField,
    ],
  },
  {
    id: 'webdav', label: 'WebDAV', description: 'Nextcloud, ownCloud, Яндекс Диск (webdav.yandex.ru), Synology и любой сервер WebDAV.',
    fields: [
      { key: 'url', label: 'Адрес', type: 'url', required: true, placeholder: 'https://cloud.example.com/remote.php/dav/files/user/' },
      { key: 'username', label: 'Логин', type: 'text' },
      { key: 'password', label: 'Пароль', type: 'secret', description: 'Для Nextcloud и Яндекс Диска лучше пароль приложения.' },
      prefixField,
    ],
  },
];

export const storageKindById: ReadonlyMap<string, StorageKindDefinition> = new Map(storageKindDefinitions.map(kind => [kind.id, kind]));

export function isStorageKind(value: unknown): value is StorageKind {
  return typeof value === 'string' && storageKindById.has(value);
}

/** Which photos go to a storage: every upload as soon as its files are ready, or only photos once they are approved. */
export const storagePublishModes = [
  { id: 'all', label: 'Все загрузки', description: 'Сразу после загрузки, включая снимки на модерации.' },
  { id: 'published', label: 'Только опубликованные', description: 'После одобрения модератором.' },
] as const;
export type StoragePublishMode = typeof storagePublishModes[number]['id'];

export function isStoragePublishMode(value: unknown): value is StoragePublishMode {
  return storagePublishModes.some(mode => mode.id === value);
}

/** Replica states as stored in ng_media_replicas.status. */
export const replicaStatuses = {
  pending: 0,
  published: 1,
  failed: 2,
  /** The last check did not find the file in the storage. */
  missing: 3,
  /** The file is there but its size or checksum differs from the original. */
  mismatch: 4,
} as const;
export type ReplicaStatus = keyof typeof replicaStatuses;

export const replicaStatusLabels: Record<ReplicaStatus, string> = {
  pending: 'В очереди', published: 'Опубликован', failed: 'Ошибка', missing: 'Не найден', mismatch: 'Не совпадает',
};

export function replicaStatusName(code: number): ReplicaStatus {
  return (Object.entries(replicaStatuses).find(([, value]) => value === code)?.[0] ?? 'pending') as ReplicaStatus;
}

/** GET /api/admin/storage: a storage with its settings (secrets blanked, see `secrets`) and publication totals. */
export interface StorageTargetData {
  id: number;
  title: string;
  kind: StorageKind;
  enabled: boolean;
  mode: StoragePublishMode;
  config: Record<string, string>;
  /** Secret fields that have a value stored; their value comes back empty. */
  secrets: string[];
  createdAt: string;
  lastCheck: { at: string; deep: boolean; checked: number; problems: number; error: string | null } | null;
  /** Files by replica status. */
  files: Record<ReplicaStatus, number>;
  /** Photos that should be in this storage, and how many of them have every file published. */
  photos: { eligible: number; published: number };
  /** Publication and check jobs still queued for this storage. */
  queued: number;
}

export interface StorageOverview {
  targets: StorageTargetData[];
  /** Where the media worker reads originals from, for the help text. */
  mediaRoot: string;
  /** The redirect URI to register in the Google OAuth client for «Войти через Google». */
  googleRedirectUri: string;
  /** The site has its own Google client (GOOGLE_CLIENT_ID), so Drive storages connect with a code, without a Client ID. */
  googleDevice: boolean;
}

export interface StorageReplicaData {
  id: number;
  photoId: number;
  file: string;
  status: ReplicaStatus;
  size: number | null;
  publishedAt: string | null;
  checkedAt: string | null;
  error: string | null;
}

export interface StorageReplicaPage {
  total: number;
  page: number;
  pages: number;
  replicas: StorageReplicaData[];
}

/** POST /api/admin/storage/:id/test */
export interface StorageTestResult {
  ok: boolean;
  message: string;
  milliseconds: number;
}

/** POST /api/admin/storage/:id/google/device: the code to enter on Google's page. */
export interface GoogleDeviceStart {
  handle: string;
  userCode: string;
  verificationUrl: string;
  /** Seconds the code stays valid. */
  expiresIn: number;
  /** Seconds to wait between polls. */
  interval: number;
}

/** POST /api/admin/storage/:id/google/device/poll */
export interface GoogleDevicePoll {
  status: 'pending' | 'connected' | 'denied' | 'expired' | 'error';
  message?: string;
  account?: string;
}

/** Payloads of the PublishMedia and VerifyMedia jobs. */
export interface PublishMediaJob { targetId: number; photoId: number; force?: boolean }
export interface VerifyMediaJob { targetId: number; deep?: boolean; photoId?: number; scheduled?: boolean }

/** A Google Drive storage set up for «Войти через Google» that has no account connected yet. */
export function needsGoogleSignIn(kind: string, config: Record<string, string>, secrets: readonly string[] = Object.keys(config).filter(key => config[key])) {
  return kind === 'gdrive' && !secrets.includes('serviceAccount') && !secrets.includes('refreshToken');
}
