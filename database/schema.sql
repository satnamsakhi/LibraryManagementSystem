-- ==============================================================================
-- SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM
-- RELATIONAL DATABASE SCHEMA DEFINITION (MySQL 8.0)
-- Upgraded with Cryptographic QR Entry Passes & Gate Admittance Audit Log
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS smart_library_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_library_booking;

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- Table structure for: users
-- Description: Stores authenticated user accounts (Students, Librarians, Administrators)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME(6) NULL,
  `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(254) NOT NULL UNIQUE,
  `student_id` VARCHAR(50) NULL,
  `department` VARCHAR(100) NOT NULL DEFAULT '',
  `phone` VARCHAR(20) NOT NULL DEFAULT '',
  `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT' COMMENT 'STUDENT, LIBRARIAN, ADMIN',
  `account_status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, SUSPENDED',
  `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`account_status`),
  INDEX `idx_users_student_id` (`student_id`),
  INDEX `idx_users_active_status` (`is_active`, `account_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for: seats
-- Description: Stores physical study desks, zones, floors, and maintenance flags
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `seats`;
CREATE TABLE `seats` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `seat_number` VARCHAR(20) NOT NULL UNIQUE,
  `floor` VARCHAR(50) NOT NULL DEFAULT 'First Floor',
  `section` VARCHAR(100) NOT NULL,
  `seat_type` VARCHAR(30) NOT NULL DEFAULT 'REGULAR',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_under_maintenance` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `idx_seats_number` (`seat_number`),
  INDEX `idx_seats_floor` (`floor`),
  INDEX `idx_seats_type` (`seat_type`),
  INDEX `idx_seats_active_maint` (`is_active`, `is_under_maintenance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for: time_slots
-- Description: Standardized daily booking windows configured by administration
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE `time_slots` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `slot_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `idx_slots_active` (`is_active`),
  INDEX `idx_slots_times` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for: bookings
-- Description: Stores reservation transactions and tracks seat occupancy
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` BIGINT NOT NULL,
  `seat_id` BIGINT NOT NULL,
  `slot_id` BIGINT NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_status` VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
  `cancellation_reason` VARCHAR(255) NOT NULL DEFAULT '',
  `checked_in_at` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `cancelled_at` DATETIME(6) NULL,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_seat` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_id`) REFERENCES `time_slots` (`id`) ON DELETE RESTRICT,
  INDEX `idx_bk_date_status` (`booking_date`, `booking_status`),
  INDEX `idx_bk_seat_date_stat` (`seat_id`, `booking_date`, `booking_status`),
  INDEX `idx_bk_user_date_stat` (`user_id`, `booking_date`, `booking_status`),
  INDEX `idx_bk_checked_in_at` (`checked_in_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for: checkin_passes
-- Description: Cryptographic single-use digital QR gate passes
-- Note: Raw credentials and QR image binaries are NEVER stored in the database.
-- Only the SHA-256 token hash, version, and per-pass salt are persisted.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `checkin_passes`;
CREATE TABLE `checkin_passes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT NOT NULL UNIQUE,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `salt` VARCHAR(32) NOT NULL DEFAULT '',
  `version` INT UNSIGNED NOT NULL DEFAULT 1,
  `qr_data_uri` LONGTEXT NOT NULL DEFAULT '',
  `valid_from` DATETIME(6) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used_at` DATETIME(6) NULL,
  `revoked_at` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT `fk_checkin_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  INDEX `idx_pass_token_hash` (`token_hash`),
  INDEX `idx_pass_validity` (`valid_from`, `expires_at`),
  INDEX `idx_pass_used_revoked` (`used_at`, `revoked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for: checkin_events
-- Description: Immutable audit log of all turnstile admittance scan attempts
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `checkin_events`;
CREATE TABLE `checkin_events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `pass_id` BIGINT NULL,
  `scanned_by_id` BIGINT NULL,
  `scanned_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` VARCHAR(20) NOT NULL COMMENT 'APPROVED, REJECTED',
  `rejection_reason` VARCHAR(255) NOT NULL DEFAULT '',
  `raw_token_preview` VARCHAR(32) NOT NULL DEFAULT '',
  `scanner_ip` VARCHAR(45) NOT NULL DEFAULT '',
  `user_agent` VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT `fk_event_pass` FOREIGN KEY (`pass_id`) REFERENCES `checkin_passes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_event_scanner` FOREIGN KEY (`scanned_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_event_status_time` (`status`, `scanned_at`),
  INDEX `idx_event_scanned_at` (`scanned_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;
