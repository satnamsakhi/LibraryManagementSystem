# Administrator User Manual: Smart Digital Library Slot Booking System
## Version 2.0 (Includes Gate Turnstile Scanner & Audit Logs)

This manual provides instructions for library administrators, gate staff, and facility coordinators to manage library inventory, operational schedules, student permissions, physical turnstile admittance, and analytical telemetry.

---

## 1. Accessing the Administrator Console

1. Navigate to **http://localhost:5173/login**.
2. Click the **Chief Admin Demo** button (or enter `admin@library.edu` / `AdminPassword@123`).
3. Click **Sign In**. You will be directed to the **Operations Dashboard** (`/admin`).

---

## 2. Operations Dashboard & Facility Telemetry

The Dashboard displays real-time operational indicators:
- **Total Users:** Total registered accounts, distinguishing students from staff and administrators.
- **Active Desks:** Number of operational seats currently in active circulation.
- **Under Maintenance:** Number of desks disabled for repairs or hardware checks.
- **Today's Bookings:** Confirmed desk sessions scheduled for today.
- **Today Utilization Percentage:** Proportion of total daily seating capacity currently booked:
  $$\text{Utilization} = \frac{\text{Today's Confirmed Bookings}}{\text{Active Desks} \times \text{Active Time Slots}} \times 100\%$$
- **14-Day Velocity Trend:** Bar chart tracing booking volume fluctuations over the last two weeks.
- **Floor Capacity Breakdown:** Distribution of desk occupancy across Ground Floor, First Floor, and Second Floor.
- **Live Stream:** Recent reservations logged today with student details and seat codes.

---

## 3. User Account Management (`/admin/users`)

1. **Search & Filter:** Find students by typing their name, university email, or roll ID into the search bar. Filter by role or active status.
2. **Account Deactivation:** Click **Deactivate** to suspend a student's access.
   - Shows a confirmation warning modal.
   - Immediately updates `account_status='INACTIVE'` and `is_active=False`.
   - Inactive students are immediately blocked from logging in, creating bookings, or using existing tokens.
3. **Account Activation:** Click **Activate** to restore an inactive account. The student can immediately resume booking.
4. **Role Assignment:** Click **Promote to Librarian** to assign gate scanning duties, or **Promote to Admin** for full administrative privileges.
5. **Safety Safeguards:**
   - Administrators cannot deactivate their own active administrative account.
   - Administrators cannot remove administrative privileges from themselves.
   - The system prevents deactivating or demoting the last active administrator.

---

## 4. Seat Inventory Management (`/admin/seats`)

1. **Add Desk:** Click **Add Study Desk**, specify the unique seat code (e.g., `F1-A15`), floor level, zone name, desk category (Regular Desk, Computer Workstation, Discussion Pod, Silent Cubicle), and click **Save Desk**.
2. **Maintenance Mode:** Click the edit icon on any desk and check **Under repair / maintenance**. The desk will immediately turn amber on the visual map and cannot be booked until maintenance is unchecked.
3. **Delete Desk:** Click the trash icon. The system verifies whether future confirmed bookings exist on that seat; if so, deletion is blocked to prevent breaking student reservations.

---

## 5. Time Slot Management (`/admin/slots`)

1. **Create Slot:** Click **Add Session Slot**, specify a title (e.g. `Afternoon Session II`), start time (HH:MM), and end time.
2. **Validation Rules:**
   - Start time must precede end time.
   - Duration must be between 30 minutes and 8 hours.
3. **Toggle Active Status:** Inactive slots are hidden from the student booking wizard.
4. **Delete Slot:** Blocked if active upcoming reservations rely on that time slot.

---

## 6. Master Booking Registry (`/admin/bookings`)

1. **Filter & Search:** Search bookings by reference number (`LIB-...`), student name, or seat code.
2. **Inspect Record:** Click the eye icon to view complete details, including student roll ID, department, contact telephone, check-in status, and timestamp.
3. **View Entry QR Pass:** Click the QR icon on any confirmed reservation to view the student's digital gate pass.
4. **Administrative Revocation:** Click **Cancel**, provide an administrative reason (e.g., `Emergency electrical inspection`), and confirm. The student's reservation is cancelled and the desk is released.

---

## 7. Gate QR Scanner & Turnstile Admittance (`/gate-scanner`)

1. **Access:** Available to Administrators and Gate Staff (`LIBRARIAN`).
2. **Camera Scanner Operation:**
   - Select the entrance camera device (e.g. Back Camera / USB Barcode Scanner).
   - Point the camera at the student's mobile or printed QR Entry Pass.
   - The scanner instantly decodes the pass, validates it atomically with MySQL InnoDB `select_for_update()`, and plays an audible tone.
3. **Admittance Grant Banner:**
   - Displays a prominent green banner confirming student name, roll ID, desk code, and floor.
   - Reminds staff to cross-check student photo ID.
4. **Rejection Banner:**
   - Displays a red banner explaining why admittance is denied (e.g., `Pass already used`, `Pass expired`, `Reservation cancelled`).
5. **Manual Fallback:**
   - If the student's phone screen is cracked or low contrast, type the token string or reference code into the manual entry box and click **Verify & Check-In**.

---

## 8. Admittance Audit Log (`/admin/entry-history`)

1. **Audit Register:** Review every turnstile scan attempt (approved and rejected) with exact timestamps, staff ID, IP address, and status.
2. **Search & Filter:** Search by student name, roll ID, or filter by date and approval status.
