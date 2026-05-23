CREATE DATABASE IF NOT EXISTS `CONITI_CONFERENCIAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `CONITI_CONFERENCIAS`;

CREATE TABLE IF NOT EXISTS conferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  modality VARCHAR(40) NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  capacity INT NOT NULL,
  available_seats INT NOT NULL,
  tags JSON NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_conferences_slug UNIQUE (slug),
  INDEX idx_conferences_status (status),
  INDEX idx_conferences_category (category),
  INDEX idx_conferences_modality (modality),
  INDEX idx_conferences_start_date (start_date),
  CONSTRAINT chk_conferences_capacity_positive CHECK (capacity > 0),
  CONSTRAINT chk_conferences_available_seats_non_negative CHECK (available_seats >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conference_agenda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conference_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  speaker VARCHAR(140) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  room VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conference_agenda_conference
    FOREIGN KEY (conference_id) REFERENCES conferences(id)
    ON DELETE CASCADE,
  INDEX idx_conference_agenda_conference_id (conference_id),
  INDEX idx_conference_agenda_starts_at (starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
