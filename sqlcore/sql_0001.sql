-- Добавление новых таблиц

CREATE TABLE IF NOT EXISTS `entities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `createdate` bigint NOT NULL,
  `sampledata` text NOT NULL,
  `color` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `entities_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `createdate` bigint NOT NULL,
  `entityid` int NOT NULL,
  `comment` text NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `galleries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `opened` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `photos_favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `photo_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `uploadindex_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `oldindex` int NOT NULL,
  `newindex` int NOT NULL,
  `date` int NOT NULL,
  `type` int NOT NULL,
  `photo_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Изменение существующих таблиц

ALTER TABLE `photos`
ADD COLUMN `gallery_id` int NOT NULL DEFAULT '0' AFTER `endmoderation`,
ADD COLUMN `entitydata_id` int NOT NULL AFTER `gallery_id`;

ALTER TABLE `photos_comments`
ADD COLUMN `content` text NOT NULL AFTER `posted_at`;

ALTER TABLE `photos_rates`
ADD COLUMN `contest` int NOT NULL DEFAULT '0' AFTER `type`;

ALTER TABLE `users`
MODIFY COLUMN `online` int NOT NULL DEFAULT '0',
MODIFY COLUMN `admin` int NOT NULL;

-- Обновление кодировки для таблиц, использующих utf8
ALTER TABLE `followers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `followers_notifications` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `news` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE `photos_views` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;