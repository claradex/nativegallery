-- Home page blocks managed from the admin panel («Главная страница»), after transphoto.org's front page.
--   visibility  0 everyone, 1 signed-in visitors only, 2 nobody
--   title       heading override (NULL keeps the default)
--   body        HTML of the custom block
-- Missing rows fall back to the defaults in contracts (HomeBlocks.ts).

CREATE TABLE `ng_home_blocks` (
  `key` VARCHAR(32) NOT NULL,
  `visibility` TINYINT NOT NULL DEFAULT 0,
  `sort` INT NOT NULL DEFAULT 0,
  `title` VARCHAR(255) NULL,
  `body` MEDIUMTEXT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News get a kind (0 site news, 1 transport news) and, for transport news, the GeoDB city they are about.
ALTER TABLE `news` ADD COLUMN `kind` TINYINT NOT NULL DEFAULT 0, ADD COLUMN `city_id` INT NULL;
CREATE INDEX `news_kind_idx` ON `news` (`kind`);
