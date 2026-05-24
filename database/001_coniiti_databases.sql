CREATE DATABASE IF NOT EXISTS `CONIITI_AUTH`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `CONIITI_CONFERENCIAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `CONIITI_CONFERENCISTAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `CONIITI_FECHAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `CONIITI_AUTH`;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'attendee',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_password_reset_tokens_token UNIQUE (token),
  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_password_reset_tokens_user_id (user_id),
  INDEX idx_password_reset_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE `CONIITI_CONFERENCIAS`;

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

USE `CONIITI_CONFERENCISTAS`;

CREATE TABLE IF NOT EXISTS speakers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  initials VARCHAR(12) NOT NULL,
  institution VARCHAR(160) NOT NULL,
  country VARCHAR(80) NOT NULL,
  country_code VARCHAR(8) NOT NULL,
  city VARCHAR(120) NOT NULL,
  bio TEXT NOT NULL,
  expertise JSON NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_speakers_slug UNIQUE (slug),
  INDEX idx_speakers_country (country),
  INDEX idx_speakers_institution (institution),
  INDEX idx_speakers_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS speaker_talks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  speaker_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  abstract TEXT NOT NULL,
  topic VARCHAR(100) NOT NULL,
  duration_minutes INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_speaker_talks_speaker
    FOREIGN KEY (speaker_id) REFERENCES speakers(id)
    ON DELETE CASCADE,
  INDEX idx_speaker_talks_speaker_id (speaker_id),
  INDEX idx_speaker_talks_topic (topic),
  CONSTRAINT chk_speaker_talks_duration_positive CHECK (duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS speaker_event_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  speaker_id INT NOT NULL,
  conference_id INT NULL,
  conference_title VARCHAR(180) NOT NULL,
  participation_type VARCHAR(60) NOT NULL,
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_speaker_event_links_speaker
    FOREIGN KEY (speaker_id) REFERENCES speakers(id)
    ON DELETE CASCADE,
  INDEX idx_speaker_event_links_speaker_id (speaker_id),
  INDEX idx_speaker_event_links_conference_id (conference_id),
  INDEX idx_speaker_event_links_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE `CONIITI_FECHAS`;

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
