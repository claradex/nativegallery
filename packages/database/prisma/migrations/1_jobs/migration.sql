CREATE TABLE ng_jobs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(32) NOT NULL,
  dedupe_key VARCHAR(191) NOT NULL UNIQUE,
  payload JSON NOT NULL,
  available_at DATETIME(3) NOT NULL,
  lease_until DATETIME(3),
  lease_token VARCHAR(36),
  attempts INT NOT NULL DEFAULT 0,
  completed_at DATETIME(3),
  last_error TEXT,
  INDEX ng_jobs_kind_completed_at_available_at_idx (kind, completed_at, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE ng_job_schedules (
  kind VARCHAR(32) NOT NULL PRIMARY KEY,
  enabled BOOLEAN NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
