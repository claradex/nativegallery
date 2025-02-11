-- Migration script to update database schema

-- Drop tables that are no longer needed
-- (No tables to drop as all tables in 111.sql exist in 222.sql)

-- Add new tables from 222.sql that don't exist in 111.sql
CREATE TABLE IF NOT EXISTS `contests` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `themeid` int(10) NOT NULL,
  `opendate` int(100) NOT NULL,
  `closedate` int(10) NOT NULL,
  `status` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `geodb` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `servicekeys` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `type` text NOT NULL,
  `status` int(10) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modify existing tables to add new columns
ALTER TABLE `photos`
  ADD COLUMN IF NOT EXISTS `pinnedcomment_id` int(10) NOT NULL DEFAULT 0 AFTER `entitydata_id`;

-- Set AUTO_INCREMENT values for the new tables
ALTER TABLE `contests` AUTO_INCREMENT = 1;
ALTER TABLE `geodb` AUTO_INCREMENT = 1;
ALTER TABLE `servicekeys` AUTO_INCREMENT = 1;

-- Commit the changes
COMMIT;