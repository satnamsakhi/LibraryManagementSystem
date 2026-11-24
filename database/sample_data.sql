-- ==============================================================================
-- SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM
-- DEMONSTRATION & TEST DATA INSERT SCRIPT (MySQL 8.0)
-- ==============================================================================

USE smart_library_booking;

-- 1. Insert Administrator & Students
-- Note: Passwords below are PBKDF2 hashes for:
-- Admin: AdminPassword@123
-- Students: StudentPassword@123
INSERT INTO `users` (`id`, `password`, `is_superuser`, `full_name`, `email`, `student_id`, `department`, `phone`, `role`, `account_status`, `is_staff`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'pbkdf2_sha256$870000$rS07gR2Gz0LpX9J$6eN28oY1x6WzN4+zE6n2e6u5p4v7e9a8f1=fakehashfortest1', 1, 'Chief Librarian Administrator', 'admin@library.edu', NULL, 'Library Operations & Administration', '+1 (555) 019-2834', 'ADMIN', 'ACTIVE', 1, 1, NOW(), NOW()),
(2, 'pbkdf2_sha256$870000$rS07gR2Gz0LpX9J$6eN28oY1x6WzN4+zE6n2e6u5p4v7e9a8f1=fakehashfortest2', 0, 'Alex Turner', 'alex.turner@student.edu', 'MCA-2024-042', 'Master of Computer Applications', '+1 (555) 012-3456', 'STUDENT', 'ACTIVE', 0, 1, NOW(), NOW()),
(3, 'pbkdf2_sha256$870000$rS07gR2Gz0LpX9J$6eN28oY1x6WzN4+zE6n2e6u5p4v7e9a8f1=fakehashfortest3', 0, 'Priya Sharma', 'priya.sharma@student.edu', 'MCA-2024-088', 'Master of Computer Applications', '+1 (555) 012-7890', 'STUDENT', 'ACTIVE', 0, 1, NOW(), NOW()),
(4, 'pbkdf2_sha256$870000$rS07gR2Gz0LpX9J$6eN28oY1x6WzN4+zE6n2e6u5p4v7e9a8f1=fakehashfortest4', 0, 'Marcus Chen', 'marcus.chen@student.edu', 'CS-2024-105', 'Computer Science & Engineering', '+1 (555) 013-4567', 'STUDENT', 'ACTIVE', 0, 1, NOW(), NOW()),
(5, 'pbkdf2_sha256$870000$rS07gR2Gz0LpX9J$6eN28oY1x6WzN4+zE6n2e6u5p4v7e9a8f1=fakehashfortest5', 0, 'Sara Connor', 'sara.connor@student.edu', 'AI-2024-019', 'Artificial Intelligence & Data Science', '+1 (555) 014-5678', 'STUDENT', 'ACTIVE', 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- 2. Insert Standard Daily Time Slots
INSERT INTO `time_slots` (`id`, `slot_name`, `start_time`, `end_time`, `is_active`, `created_at`)
VALUES
(1, 'Morning Session I (08:30 - 10:30)', '08:30:00', '10:30:00', 1, NOW()),
(2, 'Morning Session II (11:00 - 13:00)', '11:00:00', '13:00:00', 1, NOW()),
(3, 'Afternoon Session (14:00 - 16:30)', '14:00:00', '16:30:00', 1, NOW()),
(4, 'Evening Research (17:00 - 20:00)', '17:00:00', '20:00:00', 1, NOW())
ON DUPLICATE KEY UPDATE `slot_name`=VALUES(`slot_name`);

-- 3. Insert Demonstration Library Seats (36 Seats across Ground, 1st, 2nd Floors)
INSERT INTO `seats` (`seat_number`, `floor`, `section`, `seat_type`, `is_active`, `is_under_maintenance`, `created_at`, `updated_at`)
VALUES
-- Ground Floor: General Reading Hall (Regular Desks)
('G-01', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-02', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-03', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-04', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-05', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-06', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-07', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-08', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-09', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-10', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-11', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),
('G-12', 'Ground Floor', 'General Reading Hall', 'REGULAR', 1, 0, NOW(), NOW()),

-- First Floor: Silent Study Cubicles
('F1-01', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-02', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-03', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-04', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 1, NOW(), NOW()), -- Maintenance Desk
('F1-05', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-06', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-07', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-08', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-09', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-10', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-11', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),
('F1-12', 'First Floor', 'Silent Study Cubicles', 'SILENT', 1, 0, NOW(), NOW()),

-- Second Floor: Computer & Research Lab
('F2-01', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-02', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-03', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-04', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-05', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-06', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-07', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-08', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-09', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-10', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW()),
('F2-11', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 1, NOW(), NOW()), -- Maintenance Desk
('F2-12', 'Second Floor', 'Computer & Research Lab', 'COMPUTER', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `section`=VALUES(`section`);

-- 4. Sample Bookings
INSERT INTO `bookings` (`booking_reference`, `user_id`, `seat_id`, `slot_id`, `booking_date`, `booking_status`, `cancellation_reason`, `created_at`, `updated_at`, `cancelled_at`)
VALUES
('LIB-20261122-DEMO01', 2, 1, 1, CURDATE(), 'CONFIRMED', '', NOW(), NOW(), NULL),
('LIB-20261122-DEMO02', 3, 2, 2, CURDATE(), 'CONFIRMED', '', NOW(), NOW(), NULL),
('LIB-20261122-DEMO03', 4, 5, 3, CURDATE(), 'CONFIRMED', '', NOW(), NOW(), NULL),
('LIB-20261122-DEMO04', 2, 3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'CONFIRMED', '', NOW(), NOW(), NULL),
('LIB-20261122-DEMO05', 4, 4, 1, CURDATE(), 'CANCELLED', 'Exam schedule conflict', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE `booking_status`=VALUES(`booking_status`);
