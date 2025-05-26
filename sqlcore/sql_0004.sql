-- Объединенный дамп: OLD_NG + изменения из NEW_NG

-- Полный дамп исходной базы `ngallery`
-- (сохраняются все таблицы и структуры из OLD_NG.sql)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE TABLE `entities_requests` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `user_id` int(10) NOT NULL,
  `created_at` bigint(255) NOT NULL,
  `entityid` int(10) NOT NULL,
  `data` text NOT NULL,
  `status` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вносим изменения в существующие таблицы

-- Изменение `login_tokens` для добавления новых колонок
ALTER TABLE `login_tokens`
  ADD COLUMN `device_name` varchar(255) NOT NULL AFTER `user_id`,
  ADD COLUMN `os` varchar(50) NOT NULL AFTER `device_name`,
  ADD COLUMN `ip` varchar(45) NOT NULL AFTER `os`,
  ADD COLUMN `location` varchar(255) NOT NULL AFTER `ip`,
  ADD COLUMN `last_activity` bigint(255) NOT NULL AFTER `location`,
  ADD COLUMN `created_at` bigint(255) NOT NULL AFTER `last_activity`,
  ADD COLUMN `iv` varbinary(16) NOT NULL AFTER `token`;

-- Корректировка типов в `entities_data`
ALTER TABLE `entities_data`
  MODIFY COLUMN `createdate` bigint(20) NOT NULL,
  MODIFY COLUMN `comment` text DEFAULT NULL,
  MODIFY COLUMN `content` text DEFAULT NULL;

-- Завершаем транзакцию
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
