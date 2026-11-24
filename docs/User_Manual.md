# Student User Manual: Smart Digital Library Slot Booking System
## Version 2.0 (Includes Digital QR Passes & Gate Entry)

Welcome to the **Smart Digital Library Slot Booking Portal**. This manual guides students through searching for study desks, reserving time slots, viewing digital QR entry passes, checking into the library turnstile, and managing cancellations.

---

## 1. Creating an Account & Signing In

1. Open your browser and navigate to **http://localhost:5173**.
2. Click **Register** on the top navigation bar.
3. Fill in your full name, university email address, roll / student ID, and choose a secure password (minimum 8 characters).
4. After registration, you will be automatically signed in to your **Student Dashboard**.
5. Returning students can sign in directly from the **Sign In** page using their email and password (or use the one-click **Student Demo** quick-fill button).

---

## 2. Checking Live Desk Availability

1. Click **Seat Grid** on the navigation bar.
2. Select your desired study date from the date picker.
3. Choose a study session from the **Time Slot** dropdown.
4. You will see an interactive visual grid of desks color-coded by real-time status:
   - **Muted Sage (Available):** Desk is completely free for this entire time window.
   - **Soft Stone (Reserved):** Desk is already booked by another student.
   - **Terracotta (Maintenance):** Desk is currently undergoing repair or equipment testing.
   - **Deep Ink Navy (Selected):** Your currently chosen desk.
5. You can filter the display by **Floor Level** (Ground, First, Second, Third), **Library Zone**, or **Desk Category** (Regular Desk, Computer Workstation, Silent Cubicle, Discussion Pod).

---

## 3. Reserving a Study Desk (Step-by-Step)

1. Click **Book Slot** in the navigation menu (or click any free green seat on the Seat Grid).
2. **Step 1 — Date & Time:** Select your target reservation date and pick one of the 4 daily standard time slots. Click **Next: Select Desk**.
3. **Step 2 — Pick Desk:** Click on an available desk card to select it (it will highlight in Deep Ink Navy). Click **Review Reservation**.
4. **Step 3 — Review & Confirm:** Verify your student credentials, seat code, floor, and time window. Click **Confirm & Book Desk**.
5. **Step 4 — Digital Confirmation Pass:** Your booking is saved atomically in the database and a digital QR pass is generated instantly!

---

## 4. Digital QR Entry Pass & Turnstile Check-In

1. Upon booking confirmation (or from **My Reservations**), your **Digital QR Entry Pass** appears.
2. **Features of the Pass:**
   - Displays your masked Student ID (`MCA-****-042`) for privacy.
   - Displays your reserved desk number, floor, study session, and validity time window.
   - Valid starting 15 minutes before your scheduled slot until the slot end time.
   - Action buttons to **Download Pass (PNG)** or **Print Pass** for physical inspection.
3. **Turnstile Entry:**
   - Present your pass on your mobile phone screen or paper printout at the library gate scanner.
   - The scanner beeps, verifies your pass in real time, and turns green to grant turnstile admittance.
   - Note: Passes are single-use. Once scanned, they cannot be reused by anyone else.

---

## 5. Managing Your Reservations

1. Click **My Bookings** in the navigation bar.
2. Review your reservation history using the filter tabs:
   - **All Reservations**
   - **Active Today / Future**
   - **Upcoming Only**
   - **Past / Completed**
   - **Cancelled**
3. **View / Reopen Pass:** Click **View Entry QR** on any confirmed booking card to reopen your digital pass at any time.
4. **Cancelling a Booking:**
   - If your plans change, locate the booking card and click **Cancel Booking**.
   - Confirm the cancellation in the dialog prompt.
   - The reservation status immediately transitions to `CANCELLED`, the digital pass is invalidated, and the desk is released for other students to use.

---

## 6. Updating Profile & Changing Password

1. Click your name in the top right corner and select **Student Profile** (or visit `/profile`).
2. Update your personal details (phone number, department, student ID) and click **Save Profile Changes**.
3. To update your password, enter your current password, your new password, confirm it, and click **Update Password**.
