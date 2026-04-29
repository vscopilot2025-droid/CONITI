CREATE DATABASE IF NOT EXISTS `CONITI_FECHAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `CONITI_FECHAS`;

CREATE TABLE IF NOT EXISTS availabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_type VARCHAR(40) NOT NULL,
  resource_id INT NOT NULL,
  resource_name VARCHAR(180) NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  status VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_availabilities_resource (resource_type, resource_id),
  INDEX idx_availabilities_status (status),
  INDEX idx_availabilities_timezone (timezone),
  INDEX idx_availabilities_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conflicts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_type VARCHAR(40) NOT NULL,
  resource_id INT NOT NULL,
  resource_name VARCHAR(180) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  severity VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conflicts_resource (resource_type, resource_id),
  INDEX idx_conflicts_severity (severity),
  INDEX idx_conflicts_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS master_agenda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(40) NOT NULL,
  event_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  owner VARCHAR(80) NOT NULL,
  location VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_master_agenda_event (event_type, event_id),
  INDEX idx_master_agenda_owner (owner),
  INDEX idx_master_agenda_timezone (timezone),
  INDEX idx_master_agenda_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
