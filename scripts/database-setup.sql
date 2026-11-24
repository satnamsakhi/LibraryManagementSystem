-- ==============================================================================
-- DATABASE CREATION & PERMISSIONS SETUP SCRIPT
-- SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM (MySQL 8.0)
-- ==============================================================================

-- 1. Create dedicated database
CREATE DATABASE IF NOT EXISTS smart_library_booking
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 2. Optional: Create dedicated application user
CREATE USER IF NOT EXISTS 'library_user'@'localhost' IDENTIFIED BY 'LibrarySecurePass@2026';
CREATE USER IF NOT EXISTS 'library_user'@'127.0.0.1' IDENTIFIED BY 'LibrarySecurePass@2026';

-- 3. Grant full DDL and DML privileges
GRANT ALL PRIVILEGES ON smart_library_booking.* TO 'library_user'@'localhost';
GRANT ALL PRIVILEGES ON smart_library_booking.* TO 'library_user'@'127.0.0.1';

-- 4. Flush privileges
FLUSH PRIVILEGES;

SELECT 'Database smart_library_booking successfully prepared.' AS Result;
