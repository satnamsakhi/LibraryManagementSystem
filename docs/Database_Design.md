# Database Design: Smart Digital Library Slot Booking System

---

## 1. Schema Principles & Normalization

The database for the Smart Digital Library Slot Booking System is structured according to 3NF standards to eliminate anomalies in data insertion, modification, and deletion.

- **Atomicity:** All attributes contain atomic, indivisible values.
- **Functional Dependency:** Every non-key column in each table depends entirely on the primary key.
- **Referential Integrity:** Enforced via foreign keys with explicit `ON DELETE` cascading rules.

---

## 2. Relational Schema Summary

### Tables
1. `users`: Stores core authentication details, role definitions (`STUDENT`, `ADMIN`), and account activation status (`ACTIVE`, `INACTIVE`).
2. `seats`: Stores library desk numbers, floor assignments, zone names, seat types, and operational maintenance flags.
3. `time_slots`: Stores pre-defined study intervals with start and end times.
4. `bookings`: Stores transactional reservation passes, foreign key references, booking dates, and status codes (`CONFIRMED`, `CANCELLED`, `COMPLETED`).

---

## 3. Data Integrity & Concurrency Control

### 3.1 Foreign Key Constraint Behaviors
- `bookings.user_id` &rarr; `users.id`: `ON DELETE CASCADE` (Removing a user purges their reservation history).
- `bookings.seat_id` &rarr; `seats.id`: `ON DELETE RESTRICT` (A physical seat record cannot be dropped while linked to active reservations).
- `bookings.slot_id` &rarr; `time_slots.id`: `ON DELETE RESTRICT` (A time slot cannot be removed while active bookings exist).

### 3.2 Row-Level Locking with `select_for_update()`
Under concurrent request conditions (e.g. 100 students attempting to book the same desk simultaneously when registration opens), standard naive database queries could suffer from race conditions resulting in double bookings.

The system executes:
```python
with transaction.atomic():
    locked_seat = Seat.objects.select_for_update().get(id=seat.id)
    # Validate availability under lock...
    # Create booking record...
```
This forces concurrent database transactions to wait until the first transaction commits or rolls back, guaranteeing zero duplicate bookings.

---

## 4. Indexing Strategy

To maintain sub-100ms response times on high-volume queries:
1. `users.email`: Unique B-Tree index for instantaneous authentication lookups.
2. `seats.seat_number`: Unique index.
3. `bookings.booking_reference`: Unique index for swift pass verification.
4. Composite index `idx_bk_date_status` (`booking_date`, `booking_status`): Accelerates seat availability grid calculation.
5. Composite index `idx_bk_seat_date_stat` (`seat_id`, `booking_date`, `booking_status`): Optimizes overlap checks during reservation creation.
