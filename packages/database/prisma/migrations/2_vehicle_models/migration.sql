-- Three levels of the rolling-stock database, the way transphoto.org has them:
--   entities         the kind of entity (Трамвай, Троллейбус …) with its custom field template;
--   entities_models  a model shared by every city and country (71-931 «Витязь»);
--   entities_data    one concrete vehicle of a model in a city (Санкт-Петербург, № 5000), the row photos link to.
-- GeoDB becomes a tree of countries, regions, cities, depots and free places.

ALTER TABLE `geodb`
  ADD COLUMN `parent_id` INT NULL,
  ADD COLUMN `kind` TINYINT NOT NULL DEFAULT 5,
  ADD COLUMN `code` VARCHAR(8) NULL,
  ADD COLUMN `sort` INT NOT NULL DEFAULT 0,
  ADD INDEX `geodb_parent_id_idx` (`parent_id`),
  ADD INDEX `geodb_kind_idx` (`kind`);

CREATE TABLE `entities_models` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entityid` INT NOT NULL,
  `parent_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `manufacturer` VARCHAR(255) NULL,
  `built_from` SMALLINT NULL,
  `built_to` SMALLINT NULL,
  `description` TEXT NULL,
  `content` TEXT NULL,
  `createdate` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `entities_models_entityid_idx` (`entityid`),
  INDEX `entities_models_parent_id_idx` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partial dates (built, started, retired, scrapped) are stored as 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD' so they sort as text.
ALTER TABLE `entities_data`
  ADD COLUMN `model_id` INT NULL,
  ADD COLUMN `city_id` INT NULL,
  ADD COLUMN `depot_id` INT NULL,
  ADD COLUMN `factory_number` VARCHAR(64) NULL,
  ADD COLUMN `vin` VARCHAR(64) NULL,
  ADD COLUMN `built` VARCHAR(10) NULL,
  ADD COLUMN `started` VARCHAR(10) NULL,
  ADD COLUMN `retired` VARCHAR(10) NULL,
  ADD COLUMN `scrapped` VARCHAR(10) NULL,
  ADD COLUMN `status` TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN `purpose` TINYINT NOT NULL DEFAULT 0,
  ADD INDEX `entities_data_entityid_idx` (`entityid`),
  ADD INDEX `entities_data_model_id_idx` (`model_id`),
  ADD INDEX `entities_data_city_id_idx` (`city_id`),
  ADD INDEX `entities_data_depot_id_idx` (`depot_id`);

ALTER TABLE `entities_requests`
  ADD COLUMN `model_id` INT NULL,
  ADD COLUMN `city_id` INT NULL;

ALTER TABLE `photos` ADD INDEX `photos_entitydata_id_idx` (`entitydata_id`);

-- Vehicles on a photo, left to right; `photos.entitydata_id` keeps the first one.
CREATE TABLE `photos_vehicles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `photo_id` INT NOT NULL,
  `entitydata_id` INT NOT NULL,
  `position` TINYINT NOT NULL DEFAULT 0,
  `route` VARCHAR(16) NULL,
  `note` VARCHAR(255) NULL,
  `angle` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `photos_vehicles_photo_id_idx` (`photo_id`),
  INDEX `photos_vehicles_entitydata_id_idx` (`entitydata_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
