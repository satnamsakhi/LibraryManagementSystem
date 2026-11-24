# Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places"
    SEATS ||--o{ BOOKINGS : "is reserved in"
    TIME_SLOTS ||--o{ BOOKINGS : "defines time window for"

    USERS {
        bigint id PK
        string email UK "Primary Login"
        string password "PBKDF2 SHA-256"
        string full_name
        string student_id
        string department
        string phone
        string role "STUDENT | ADMIN"
        string account_status "ACTIVE | INACTIVE"
        boolean is_staff
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    SEATS {
        bigint id PK
        string seat_number UK "e.g. F1-01"
        string floor "Ground | 1st | 2nd | 3rd"
        string section "Zone Name"
        string seat_type "REGULAR | COMPUTER | DISCUSSION | SILENT"
        boolean is_active
        boolean is_under_maintenance
        datetime created_at
        datetime updated_at
    }

    TIME_SLOTS {
        bigint id PK
        string slot_name "Session Title"
        time start_time
        time end_time
        boolean is_active
        datetime created_at
    }

    BOOKINGS {
        bigint id PK
        string booking_reference UK "LIB-YYYYMMDD-XXXX"
        bigint user_id FK "REFERENCES USERS(id)"
        bigint seat_id FK "REFERENCES SEATS(id)"
        bigint slot_id FK "REFERENCES TIME_SLOTS(id)"
        date booking_date "YYYY-MM-DD"
        string booking_status "CONFIRMED | CANCELLED | COMPLETED"
        string cancellation_reason
        datetime created_at
        datetime updated_at
        datetime cancelled_at
    }
```

---

## Relationship Cardinalities & Rules

1. **User to Bookings (`1:N`):**
   - One student can make multiple reservations across different dates or distinct non-overlapping time slots.
   - Deleting a user cascade-removes their reservation history.
2. **Seat to Bookings (`1:N`):**
   - A single physical seat can be reserved multiple times across different dates and non-conflicting time slots.
   - Restrict on delete prevents removing physical desk records while active future reservations exist.
3. **TimeSlot to Bookings (`1:N`):**
   - A standardized daily time slot is referenced by multiple seats and bookings.
   - Restrict on delete prevents deleting a time slot while future reservations depend on it.
4. **Cancellation Mechanics:**
   - When a booking's status transitions from `CONFIRMED` to `CANCELLED`, its seat and slot occupancy constraints are immediately released, allowing other students to reserve that desk for that window.
