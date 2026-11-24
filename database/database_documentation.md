# Relational Database Documentation: Smart Digital Library Slot Booking System

**Database Name:** `smart_library_booking`  
**RDBMS:** MySQL 8.0 / InnoDB Engine  
**Character Set:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  

---

## 1. Architectural Overview & Normalization

The database architecture is designed in Third Normal Form (3NF) to eliminate transitive functional dependencies and data redundancy while preserving referential integrity:

1. **Entity Separation:** User accounts, physical seating infrastructure, schedule definitions, and booking transactions are stored in separate, focused relations.
2. **Operational vs Reservation Availability:** Physical desk availability is separated into:
   - **Static Operational Availability:** Governed by `seats.is_active` and `seats.is_under_maintenance`.
   - **Dynamic Reservation Occupancy:** Computed via time-interval queries on the `bookings` table against `time_slots.start_time` and `time_slots.end_time`.
3. **Transaction Safety:** All bookings are governed by MySQL InnoDB ACID transactions using row-level locking (`SELECT ... FOR UPDATE`), preventing race conditions.

---

## 2. Table Specifications

### A. Table: `users`
Represents student researchers and administrative personnel.

| Column | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key |
| `password` | `VARCHAR(128)` | No | — | PBKDF2 with SHA-256 password hash |
| `last_login` | `DATETIME(6)` | Yes | NULL | Timestamp of last successful session |
| `is_superuser` | `TINYINT(1)` | No | 0 | Superuser administrative flag |
| `full_name` | `VARCHAR(150)` | No | — | User's full legal name |
| `email` | `VARCHAR(254)` | No | — | Unique login identifier (Indexed) |
| `student_id` | `VARCHAR(50)` | Yes | NULL | University roll / student ID |
| `department` | `VARCHAR(100)` | No | '' | Academic department |
| `phone` | `VARCHAR(20)` | No | '' | Contact telephone number |
| `role` | `VARCHAR(20)` | No | 'STUDENT' | Role: `STUDENT` or `ADMIN` |
| `account_status` | `VARCHAR(20)` | No | 'ACTIVE' | Status: `ACTIVE` or `INACTIVE` |
| `is_staff` | `TINYINT(1)` | No | 0 | Django admin staff access |
| `is_active` | `TINYINT(1)` | No | 1 | Auth active status |
| `created_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Registration timestamp |
| `updated_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Last record update timestamp |

**Indexes & Constraints:**
- Primary Key: `(`id`)`
- Unique: `(`email`)`
- Secondary Indexes: `idx_users_role (`role`)`, `idx_users_status (`account_status`)`, `idx_users_student_id (`student_id`)`

---

### B. Table: `seats`
Represents physical library desks, floor levels, zones, and maintenance conditions.

| Column | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key |
| `seat_number` | `VARCHAR(20)` | No | — | Unique seat code (e.g., `F1-01`) |
| `floor` | `VARCHAR(50)` | No | 'First Floor' | Floor: Ground, 1st, 2nd, 3rd Floor |
| `section` | `VARCHAR(100)` | No | — | Zone: General, Quiet, Computer Lab |
| `seat_type` | `VARCHAR(30)` | No | 'REGULAR' | REGULAR, COMPUTER, DISCUSSION, SILENT |
| `is_active` | `TINYINT(1)` | No | 1 | General in-service flag |
| `is_under_maintenance`| `TINYINT(1)` | No | 0 | Maintenance flag |
| `created_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Modification timestamp |

**Indexes & Constraints:**
- Primary Key: `(`id`)`
- Unique: `(`seat_number`)`
- Secondary Indexes: `idx_seats_floor (`floor`)`, `idx_seats_type (`seat_type`)`, `idx_seats_active_maint (`is_active`, `is_under_maintenance`)`

---

### C. Table: `time_slots`
Represents standardized daily study sessions configured by administrators.

| Column | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key |
| `slot_name` | `VARCHAR(100)` | No | — | Descriptive session label |
| `start_time` | `TIME` | No | — | Slot beginning time (HH:MM:SS) |
| `end_time` | `TIME` | No | — | Slot conclusion time (HH:MM:SS) |
| `is_active` | `TINYINT(1)` | No | 1 | Active for student bookings |
| `created_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes & Constraints:**
- Primary Key: `(`id`)`
- Secondary Indexes: `idx_slots_active (`is_active`)`, `idx_slots_times (`start_time`, `end_time`)`

---

### D. Table: `bookings`
Stores reservation transactions and historical attendance records.

| Column | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Auto Increment | Primary Key |
| `booking_reference` | `VARCHAR(50)` | No | — | Unique reference (LIB-YYYYMMDD-XXXX) |
| `user_id` | `BIGINT` | No | — | Foreign Key &rarr; `users.id` |
| `seat_id` | `BIGINT` | No | — | Foreign Key &rarr; `seats.id` |
| `slot_id` | `BIGINT` | No | — | Foreign Key &rarr; `time_slots.id` |
| `booking_date` | `DATE` | No | — | Calendar date of booking |
| `booking_status` | `VARCHAR(20)` | No | 'CONFIRMED' | CONFIRMED, CANCELLED, COMPLETED |
| `cancellation_reason`| `VARCHAR(255)` | No | '' | Reason for cancellation |
| `created_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Reservation timestamp |
| `updated_at` | `DATETIME(6)` | No | CURRENT_TIMESTAMP | Record change timestamp |
| `cancelled_at` | `DATETIME(6)` | Yes | NULL | Timestamp when cancelled |

**Indexes & Foreign Keys:**
- Primary Key: `(`id`)`
- Unique: `(`booking_reference`)`
- Foreign Key: `fk_bookings_user` references `users(id)` ON DELETE CASCADE
- Foreign Key: `fk_bookings_seat` references `seats(id)` ON DELETE RESTRICT
- Foreign Key: `fk_bookings_slot` references `time_slots(id)` ON DELETE RESTRICT
- Composite Indexes:
  - `idx_bk_date_status`: `(`booking_date`, `booking_status`)`
  - `idx_bk_seat_date_stat`: `(`seat_id`, `booking_date`, `booking_status`)`
  - `idx_bk_user_date_stat`: `(`user_id`, `booking_date`, `booking_status`)`
