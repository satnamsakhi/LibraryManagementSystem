# REST API Documentation
## Smart Digital Library Slot Booking System
### Version 2.0 (Security Audited — In-Memory QR Generation & Lifecycle Verification)

Base URL: `http://127.0.0.1:8000/api`  
Interactive Swagger UI: `http://127.0.0.1:8000/api/docs/`  
OpenAPI 3.0 Schema: `http://127.0.0.1:8000/api/schema/`  
ReDoc Documentation: `http://127.0.0.1:8000/api/redoc/`  

---

## 1. Authentication Endpoints

### 1.1 Register Student
- **Endpoint:** `POST /api/auth/register/`
- **Access:** Public (Unauthenticated)
- **Request Body:**
  ```json
  {
    "email": "student@univ.edu",
    "full_name": "Jane Doe",
    "student_id": "MCA-2024-099",
    "department": "Computer Applications",
    "phone": "+1 555-0192",
    "password": "SecurePassword@123",
    "confirm_password": "SecurePassword@123"
  }
  ```
- **Response (201 Created):** Returns user profile and initial access & refresh JWT tokens.

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login/`
- **Access:** Public
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response (200 OK):** Returns JWT access and refresh tokens.
- **Deactivated Account Handling:** If `account_status == 'INACTIVE'` or `is_active == False`, returns HTTP 401 Unauthorized.

### 1.3 Refresh Token
- **Endpoint:** `POST /api/auth/token/refresh/`
- **Access:** Public
- **Request Body:** `{ "refresh": "<JWT_REFRESH_TOKEN>" }`
- **Response (200 OK):** `{ "access": "<NEW_JWT_ACCESS_TOKEN>" }`

### 1.4 Get Current User
- **Endpoint:** `GET /api/auth/me/`
- **Access:** Authenticated (`Bearer <access_token>`)
- **Response (200 OK):** Returns authenticated user profile (`role`, `account_status`, `is_active`).

---

## 2. Digital QR Entry Pass Endpoints (Security Audited)

> [!IMPORTANT]
> **Database Storage Security:**
> Raw pass credentials and QR code image binaries are **NEVER persisted in the database**.
> The database stores only the SHA-256 hash `token_hash`, the cryptographic `salt`, and the token `version`.
> When an authorized student calls the pass retrieval endpoint, the QR PNG image is **generated dynamically in-memory**.

### 2.1 Retrieve Booking Digital QR Pass
- **Endpoint:** `GET /api/checkin/pass/{booking_id}/`
- **Access:** Reservation Owner or Administrator
- **Security Validations:**
  - Booking status must be `CONFIRMED` (cancelled bookings return HTTP 400).
  - Booking study window must not be expired (concluded sessions return HTTP 400).
  - Student account must be `ACTIVE` (inactive students return HTTP 400).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 14,
      "booking_reference": "LIB-20261122-C84192",
      "booking_date": "2026-11-23",
      "student_name": "Jane Doe",
      "student_id_masked": "MCA-****-099",
      "seat_number": "G-01",
      "floor": "Ground Floor",
      "slot_name": "Morning Session II",
      "start_time": "11:00:00",
      "end_time": "13:00:00",
      "qr_data_uri": "data:image/png;base64,iVBORw0KGgo...",
      "valid_from": "2026-11-23T10:45:00Z",
      "expires_at": "2026-11-23T13:00:00Z",
      "is_currently_valid": true,
      "is_used": false,
      "is_revoked": false
    }
  }
  ```

### 2.2 Reissue / Refresh Digital Pass
- **Endpoint:** `POST /api/checkin/pass/{booking_id}/refresh/`
- **Access:** Reservation Owner or Administrator
- **Behavior:**
  - Rotates `salt` and increments `version`.
  - Re-computes new `raw_token` and updates `token_hash`.
  - The previous QR token is immediately invalidated (scanning the old QR code returns HTTP 404).

---

## 3. Gate Turnstile Verification Endpoints

### 3.1 Gate QR Scan Check-In
- **Endpoint:** `POST /api/gate/check-in/`
- **Access:** Gate Staff (`LIBRARIAN`) or `ADMIN`
- **Request Body:**
  ```json
  {
    "token": "LIBPASS_..."
  }
  ```
- **Response (200 OK - Approved):**
  ```json
  {
    "success": true,
    "message": "ENTRY APPROVED — Student reservation verified successfully.",
    "data": {
      "student_name": "Jane Doe",
      "student_id_masked": "MCA-****-099",
      "seat_number": "G-01",
      "checked_in_at": "22 Nov 2026, 07:15:00 PM",
      "verified_by": "Eleanor Vance (Gate Staff)"
    }
  }
  ```
- **Diagnostic Error Responses:**
  - Raw token strings are **never echoed** in error responses.
  - Returns clear diagnostic reason: `Already used`, `Reservation cancelled`, `Early arrival`, `Pass expired`.

### 3.2 Gate Audit Log & Statistics
- `GET /api/gate/history/` — Paginated turnstile audit logs (`search`, `status`, `date`).
- `GET /api/gate/stats/` — Today's turnstile telemetry (total scans, approvals, rejections, approval rate).

---

## 4. Administrator User Management Endpoints

### 4.1 Partial Update User Status & Role
- **Endpoint:** `PATCH /api/admin/users/{id}/`
- **Access:** System Administrator (`ADMIN`)
- **Payloads:**
  - Deactivate student: `{ "account_status": "INACTIVE" }` (sets `is_active=False`, invalidates existing JWT tokens).
  - Activate student: `{ "account_status": "ACTIVE" }` (sets `is_active=True`).
  - Promote to Librarian: `{ "role": "LIBRARIAN" }`.
- **Enforced Safeguards:**
  - Admin cannot deactivate self (HTTP 400).
  - Admin cannot demote self (HTTP 400).
  - Last active admin cannot be deactivated or demoted (HTTP 400).
