CREATE DATABASE IF NOT EXISTS `CONIITI_CONFERENCISTAS`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

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
