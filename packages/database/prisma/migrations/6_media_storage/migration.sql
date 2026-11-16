-- External storages for photos and videos (admin panel «Хранилища»): a second disk, Google Drive, S3, WebDAV.
--   kind    disk | gdrive | s3 | webdav
--   mode    all — every upload, published — only approved photos
--   config  JSON settings of the storage, secrets included
CREATE TABLE `ng_storage_targets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `mode` VARCHAR(16) NOT NULL DEFAULT 'all',
  `config` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_check_at` DATETIME(3) NULL,
  `last_check_deep` BOOLEAN NOT NULL DEFAULT false,
  `last_check_count` INT NOT NULL DEFAULT 0,
  `last_check_problems` INT NOT NULL DEFAULT 0,
  `last_check_error` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A file of a photo in a storage. status: 0 queued, 1 published, 2 failed, 3 missing on check, 4 size/checksum mismatch.
CREATE TABLE `ng_media_replicas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `target_id` INT NOT NULL,
  `photo_id` INT NOT NULL,
  `file` VARCHAR(191) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 0,
  `size` BIGINT NULL,
  `sha256` CHAR(64) NULL,
  `remote_id` VARCHAR(255) NULL,
  `published_at` DATETIME(3) NULL,
  `checked_at` DATETIME(3) NULL,
  `error` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ng_media_replicas_target_id_file_key` (`target_id`, `file`),
  INDEX `ng_media_replicas_photo_id_idx` (`photo_id`),
  INDEX `ng_media_replicas_target_id_status_idx` (`target_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
