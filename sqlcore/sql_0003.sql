-- Add new tables for contest functionality
CREATE TABLE IF NOT EXISTS `contests_pretends` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `photo_id` int(10) NOT NULL,
  `contest_id` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contests_rates` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `photo_id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `contest_id` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contests_themes` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `status` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contests_winners` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `photo_id` int(10) NOT NULL,
  `place` int(10) NOT NULL,
  `contest_id` int(10) NOT NULL,
  `date` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `photos_rates_contest` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `photo_id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `contest_id` int(10) NOT NULL,
  `type` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new pages table
CREATE TABLE IF NOT EXISTS `pages` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `created_by` int(10) NOT NULL,
  `created_at` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modify existing tables

-- Update contests table
SET @s = (SELECT IF(
    EXISTS(
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'contests'
        AND COLUMN_NAME = 'openpretendsdate'
    ),
    'SELECT 1',
    'ALTER TABLE `contests` ADD COLUMN `openpretendsdate` int(10) NOT NULL AFTER `themeid`'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    EXISTS(
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'contests'
        AND COLUMN_NAME = 'closepretendsdate'
    ),
    'SELECT 1',
    'ALTER TABLE `contests` ADD COLUMN `closepretendsdate` int(10) NOT NULL AFTER `openpretendsdate`'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update entities table
ALTER TABLE `entities` MODIFY `createdate` bigint(20) NOT NULL;

-- Update news table
ALTER TABLE `news` MODIFY `body` mediumtext NOT NULL;

-- Update photos table
SET @s = (SELECT IF(
    EXISTS(
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'photos'
        AND COLUMN_NAME = 'on_contest'
    ),
    'SELECT 1',
    'ALTER TABLE `photos` ADD COLUMN `on_contest` int(10) NOT NULL DEFAULT 0 AFTER `pinnedcomment_id`'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    EXISTS(
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'photos'
        AND COLUMN_NAME = 'contest_id'
    ),
    'SELECT 1',
    'ALTER TABLE `photos` ADD COLUMN `contest_id` int(10) NOT NULL DEFAULT 0 AFTER `on_contest`'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update charset and collation for tables
ALTER TABLE `entities` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `entities_data` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `followers` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `followers_notifications` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `galleries` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `news` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos_favorite` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos_views` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `uploadindex_history` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `login_tokens` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos_comments` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos_comments_rates` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `photos_rates` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `users` 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;