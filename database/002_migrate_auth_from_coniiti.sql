CREATE DATABASE IF NOT EXISTS `CONIITI_AUTH`
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

INSERT IGNORE INTO `CONIITI_AUTH`.users (
  id,
  full_name,
  email,
  password_hash,
  role,
  last_login_at,
  created_at,
  updated_at
)
SELECT
  id,
  full_name,
  email,
  password_hash,
  COALESCE(role, 'attendee'),
  last_login_at,
  created_at,
  updated_at
FROM `CONIITI`.users;

INSERT IGNORE INTO `CONIITI_AUTH`.password_reset_tokens (
  id,
  token,
  user_id,
  expires_at,
  used_at,
  created_at
)
SELECT
  id,
  token,
  user_id,
  expires_at,
  used_at,
  created_at
FROM `CONIITI`.password_reset_tokens;
