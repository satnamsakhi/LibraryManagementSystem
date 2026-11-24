# System Architecture: Smart Digital Library Slot Booking System
## Version 2.0 Architectural Specification

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (Browser)"]
        UI["React 18 SPA (Vite + Tailwind CSS)"]
        Router["React Router DOM (Role Protected Routes)"]
        CameraScanner["Gate QR Camera Scanner (@zxing/browser)"]
        AxiosClient["Axios Client + JWT Silent Refresh"]
    end

    subgraph SecurityLayer ["Security & RBAC Layer"]
        JWT["SimpleJWT Authentication"]
        Perms["Role Permissions: IsActiveStudent, IsGateStaffOrAdmin, IsAdminUserRole"]
        Hasher["Pass Token Hasher (SHA-256)"]
    end

    subgraph ServiceLayer ["Django Application Services Layer"]
        AccountService["Account & User Lifecycle Service"]
        SeatService["Physical Seat & Zone Service"]
        BookingService["Booking Concurrency & Overlap Engine"]
        CheckInService["QR Gate Pass & Turnstile Admittance Service"]
        DashboardService["Analytics & Capacity Telemetry Service"]
    end

    subgraph DataLayer ["Data Persistence Layer (MySQL 8.0 InnoDB)"]
        UsersTbl[("users (STUDENT, LIBRARIAN, ADMIN)")]
        SeatsTbl[("seats")]
        SlotsTbl[("time_slots")]
        BookingsTbl[("bookings (checked_in_at)")]
        PassesTbl[("checkin_passes (token_hash, valid_from, expires_at)")]
        EventsTbl[("checkin_events (admittance audit log)")]
    end

    UI --> Router
    Router --> CameraScanner
    Router --> AxiosClient
    AxiosClient -- "HTTPS / JSON REST APIs" --> JWT
    JWT --> Perms
    Perms --> ServiceLayer
    ServiceLayer --> Hasher
    ServiceLayer -- "select_for_update() pessimistic lock" --> DataLayer
```

---

## 2. Core Architectural Upgrades

### 2.1 User Lifecycle & Token Invalidation
- **Single Source of Truth:** `User.account_status` and Django's native `User.is_active` are strictly synchronized via `User.save()`.
- **Token Invalidation:** When an administrator deactivates a user via `PATCH /api/admin/users/{id}/`, setting `account_status='INACTIVE'` immediately flags `is_active=False`. On the student's next request, SimpleJWT's `JWTAuthentication` evaluates `is_active` and rejects the token with HTTP 401.
- **Safety Protections:**
  - Self-deactivation prevention.
  - Self-demotion prevention.
  - Last-admin protection (system prevents deactivating or demoting the only active administrator).

### 2.2 Cryptographic QR Gate Verification Architecture
- **Token Cryptography:**
  - Token string: `LIBPASS_<base64url>` (256 bits of cryptographically secure random entropy via `secrets.token_urlsafe(32)`).
  - Storage: The raw token is NEVER stored in the database. Only its SHA-256 hash (`hashlib.sha256(raw_token.encode()).hexdigest()`) is stored in `checkin_passes.token_hash`.
  - Pass Display: The QR code encodes `LIBPASS_...` and is rendered as a Deep Ink Navy vector data URI using Python's `qrcode[pil]`.
- **Admittance Verification:**
  - Turnstile camera scanner decodes token via `@zxing/browser`.
  - Sent to `POST /api/gate/check-in/`.
  - Transaction opens `transaction.atomic()` with `select_for_update()` on the `CheckInPass` and `Booking` rows.
  - Verifies: Hash match, booking status `CONFIRMED`, `used_at is NULL`, `revoked_at is NULL`, and `valid_from <= now <= expires_at` (with 15-minute early arrival buffer).
  - On approval: Stamps `used_at = now()`, `booking.checked_in_at = now()`, and logs an `APPROVED` admittance event into `checkin_events`.
  - On rejection: Logs a `REJECTED` event with specific audit reason.

---

## 3. QR Gate Verification Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Gate Staff / Turnstile
    participant Scanner as GateScanner.jsx (@zxing)
    participant API as GateCheckInView
    participant Service as CheckInService
    participant DB as MySQL 8 InnoDB

    Staff->>Scanner: Scan Student Digital QR Pass
    Scanner->>API: POST /api/gate/check-in/ {token: "LIBPASS_..."}
    API->>Service: verify_and_check_in(staff_user, token)
    Note over Service,DB: Open transaction.atomic()
    Service->>DB: CheckInPass.select_for_update().get(token_hash=sha256(token))
    DB-->>Service: Exclusive Row Lock on Pass
    alt Pass Not Found or Hash Mismatch
        Service->>DB: Log REJECTED CheckInEvent
        API-->>Scanner: HTTP 400 Bad Request (Invalid QR Pass)
    else Pass Already Used (used_at is not NULL)
        Service->>DB: Log REJECTED CheckInEvent (Already Used)
        API-->>Scanner: HTTP 400 Bad Request (Pass Already Used)
    else Pass Expired or Before Valid Time Window
        Service->>DB: Log REJECTED CheckInEvent (Window Violation)
        API-->>Scanner: HTTP 400 Bad Request (Window Violation)
    else Pass Valid & Booking Active
        Service->>DB: UPDATE checkin_passes SET used_at = NOW()
        Service->>DB: UPDATE bookings SET checked_in_at = NOW()
        Service->>DB: INSERT INTO checkin_events (status='APPROVED')
        Note over Service,DB: Commit Transaction & Release Lock
        API-->>Scanner: HTTP 200 OK (Admittance Granted & Student Details)
        Scanner-->>Staff: Visual Green Pass Banner + Audio Chime
    end
```

---

## 4. Contemporary Academic Editorial UI Design System

The application interface follows an **Editorial Academic Design System** tailored to prestigious university research libraries:

| Design Token | Hex Code | Utility Class | Purpose |
|---|---|---|---|
| **Deep Ink Navy** | `#243447` | `bg-ink`, `text-ink` | Navigation bar, major headers, primary actions, QR pass lines |
| **Warm Paper** | `#F5F1E8` | `bg-paper`, `text-paper` | Application background, subtle content containers |
| **Muted Sage** | `#899783` | `bg-sage`, `text-sage` | Available seat indicators, approval banners, librarian accents |
| **Terracotta** | `#B36B50` | `bg-terracotta` | Reserved seats, warning accents, academic section badges |
| **Charcoal** | `#343A3F` | `text-charcoal` | High-contrast body text, readable data rows |
| **Soft Stone** | `#DED9CE` | `border-stone`, `bg-stone/20` | Crisp dividers, subtle card borders, inactive status badges |

- **Typography:**
  - Headings: `Source Serif 4` (`font-serif`) for academic elegance and institutional authority.
  - Body & UI: `DM Sans` (`font-sans`) for clean legibility on data tables and forms.
  - Identifiers: Monospace (`font-mono`) for desk codes, references, and time windows.
