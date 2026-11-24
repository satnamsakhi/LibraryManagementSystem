# Testing Documentation: Smart Digital Library Slot Booking System
## Comprehensive Security & Verification Report (42 Automated Tests on MySQL 8.0 InnoDB)

---

## 1. Test Reconciliation & Methodology

### 1.1 Test Count Reconciliation (40 vs 41 vs 42)
- **Previous Discrepancy Explained:**
  - An earlier documentation draft listed 41 verification IDs (`AUTH-01` through `AUTH-08`, `ADMIN-01` to `ADMIN-08`, `SEAT-01` to `SEAT-05`, `BOOK-01` to `BOOK-11`, and `GATE-01` to `GATE-09`).
  - However, in `apps/accounts/tests/test_auth.py`, there were **7** test methods (`test_protected_me_endpoint_requires_token` was counted as two conceptual rows: unauthenticated and authenticated). The actual test suite discovered and executed 40 tests: $8 + 7 + 5 + 9 + 2 + 9 = 40$.
- **Current Suite (42 Tests):**
  - Two dedicated security tests were added to `apps/checkin/tests/test_checkin.py`:
    1. `test_cancelled_booking_cannot_obtain_pass`: Proves cancelled bookings cannot obtain or generate passes.
    2. `test_expired_booking_cannot_obtain_pass`: Proves past/concluded sessions cannot generate passes.
  - Furthermore, `test_qr_generation_after_booking_confirmation` was enhanced with assertions verifying that `CheckInPass.objects.get(...).qr_data_uri == ""` in the MySQL database (zero recoverable image data persisted).
  - **Actual Current Status:** **42 discovered, 42 executed, 42 passed, 0 failed** (100% pass rate on MySQL 8.0 InnoDB).

---

## 2. Test Execution Command & Actual Output

```bash
cd backend
venv\Scripts\activate
python manage.py test apps.accounts.tests apps.library.tests apps.bookings.tests apps.checkin.tests --keepdb
```

### Actual Execution Console Output:
```
Using existing test database for alias 'default'...
..........................................
----------------------------------------------------------------------
Ran 42 tests in 32.459s

OK
Preserving test database for alias 'default'...
Found 42 test(s).
System check identified no issues (0 silenced).

✅ Cancellation-release test PASSED on MySQL InnoDB
   Original booking 116 CANCELLED → Student 2 booked 117

✅ Concurrent booking test PASSED on MySQL InnoDB
   Successful booking: ID=118, Ref=LIB-20261122-4F1808
   Rejected thread error: ['Seat C-TEST-01 is already reserved for Concurrency Test Slot on 2026-11-23.']
```

---

## 3. Discovered Test Cases & Verification Matrix (42/42)

### A. Admin User Management (`test_admin_user_management.py` — 8 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 1 | `test_admin_activates_student_success` | Admin activates inactive student via PATCH; syncs `is_active=True` | **PASS** |
| 2 | `test_admin_cannot_deactivate_self` | Admin self-deactivation rejected with HTTP 400 | **PASS** |
| 3 | `test_admin_deactivates_student_success` | Admin deactivates student via PATCH; syncs `is_active=False` | **PASS** |
| 4 | `test_inactive_user_cannot_log_in` | Inactive student login rejected with HTTP 401 | **PASS** |
| 5 | `test_last_active_admin_cannot_be_deactivated` | Deactivating the only active admin rejected with HTTP 400 | **PASS** |
| 6 | `test_previously_issued_tokens_rejected_after_deactivation` | JWT access token immediately rejected once deactivated | **PASS** |
| 7 | `test_reactivation_restores_account_access` | Reactivated student can immediately log in and use portal | **PASS** |
| 8 | `test_student_cannot_deactivate_or_activate_another_account` | Student forbidden from updating user status (HTTP 403) | **PASS** |

### B. Authentication & Profile (`test_auth.py` — 7 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 9 | `test_change_password_success` | Authenticated password update succeeds | **PASS** |
| 10 | `test_login_inactive_user_rejected` | Deactivated account login blocked | **PASS** |
| 11 | `test_login_invalid_password` | Invalid password returns HTTP 401 | **PASS** |
| 12 | `test_login_success_and_jwt_tokens` | Valid credentials return access and refresh JWTs | **PASS** |
| 13 | `test_protected_me_endpoint_requires_token` | Unauthenticated access to `/api/auth/me/` returns 401; authenticated returns 200 | **PASS** |
| 14 | `test_registration_password_mismatch` | Mismatched password confirmation returns HTTP 400 | **PASS** |
| 15 | `test_user_registration_success` | Student registration creates user and issues JWT tokens | **PASS** |

### C. Library Facility Resources (`test_seats.py` — 5 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 16 | `test_admin_create_seat_success` | Admin creates study desk successfully | **PASS** |
| 17 | `test_list_seats_public` | Public seat catalog listing returns HTTP 200 | **PASS** |
| 18 | `test_seat_availability_endpoint` | Visual seat availability endpoint returns real-time grid | **PASS** |
| 19 | `test_student_cannot_create_seat` | Student desk creation blocked with HTTP 403 | **PASS** |
| 20 | `test_time_slot_duration_validation` | Slot duration under 30 minutes rejected with HTTP 400 | **PASS** |

### D. Booking Business Logic (`test_bookings.py` — 9 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 21 | `test_booking_cancellation_and_seat_rebooking` | Cancellation releases seat for immediate second student reservation | **PASS** |
| 22 | `test_duplicate_booking_prevention` | Attempting to book the same seat/slot/date rejected with HTTP 400 | **PASS** |
| 23 | `test_inactive_student_booking_rejected` | Inactive student booking attempt blocked with HTTP 400 | **PASS** |
| 24 | `test_maintenance_seat_booking_rejected` | Maintenance desk reservation blocked with HTTP 400 | **PASS** |
| 25 | `test_overlapping_seat_booking_prevention` | Overlapping time intervals on same seat blocked with HTTP 400 | **PASS** |
| 26 | `test_overlapping_user_booking_prevention` | Student cannot hold two simultaneous overlapping reservations | **PASS** |
| 27 | `test_past_date_booking_rejected` | Booking for past calendar dates rejected with HTTP 400 | **PASS** |
| 28 | `test_successful_booking_creation` | Valid booking created atomically with reference `LIB-...` | **PASS** |
| 29 | `test_unauthorized_cancellation_rejected` | Student cancelling another student's reservation blocked (HTTP 403) | **PASS** |

### E. Concurrency & Row-Level Locking (`test_concurrency.py` — 2 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 30 | `test_cancellation_releases_seat_for_rebooking` | Cancelled booking unlocks row and permits instant re-reservation on MySQL | **PASS** |
| 31 | `test_concurrent_booking_only_one_succeeds` | Two simultaneous threads on same seat: exactly 1 succeeds, 1 blocked by MySQL lock | **PASS** |

### F. QR Passes & Gate Verification (`test_checkin.py` — 11 Tests)
| Index | Test Name | Expected Behavior | Result |
|---|---|---|---|
| 32 | `test_cancelled_booking_cannot_obtain_pass` | Cancelled reservation cannot obtain digital QR pass | **PASS** |
| 33 | `test_cancelled_booking_qr_rejected` | Cancelled booking QR code rejected at turnstile | **PASS** |
| 34 | `test_duplicate_scan_rejected` | Scanning the same QR pass twice rejected as already used | **PASS** |
| 35 | `test_expired_booking_cannot_obtain_pass` | Concluded past session cannot obtain digital QR pass | **PASS** |
| 36 | `test_inactive_student_qr_rejected` | Deactivated student's QR pass rejected at gate | **PASS** |
| 37 | `test_qr_generation_after_booking_confirmation` | Pass generates valid in-memory Base64 PNG; MySQL DB image length is 0 | **PASS** |
| 38 | `test_qr_reissue_invalidates_earlier_pass` | Reissuing pass generates fresh token; scanning earlier token rejected (404) | **PASS** |
| 39 | `test_student_denied_gate_scanner_access` | Students forbidden from calling gate check-in API (HTTP 403) | **PASS** |
| 40 | `test_two_simultaneous_scans_only_one_succeeds` | Two concurrent turnstile scanner threads: exactly 1 approved, 1 rejected | **PASS** |
| 41 | `test_unauthorized_student_denied_another_students_qr` | Student 2 cannot view Student 1's QR pass (HTTP 404) | **PASS** |
| 42 | `test_valid_qr_verification_by_librarian_approved` | Librarian scans pass: entry approved, `checked_in_at` stamped, audit logged | **PASS** |

**Summary:** **42 discovered / 42 executed / 42 passed (100% pass rate on MySQL 8.0 InnoDB)**.
