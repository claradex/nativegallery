-- Dated events in a vehicle's life («↑ 22 декабря 1999 г. или позднее — Поступил на предприятие»),
-- shown between its photos on the vehicle page the way transphoto.org does.
--   date    partial date: YYYY, YYYY-MM or YYYY-MM-DD
--   approx  0 exact, 1 «или позднее», 2 «или ранее», 3 «около»

CREATE TABLE `entities_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entitydata_id` INT NOT NULL,
  `kind` TINYINT NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `approx` TINYINT NOT NULL DEFAULT 0,
  `note` VARCHAR(255) NULL,
  `createdate` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `entities_events_entitydata_id_idx` (`entitydata_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
