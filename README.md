# Smart Digital Library Slot Booking System
## MCA Academic Mini-Project — Enterprise Full-Stack Web Application

[![Python 3.14](https://img.shields.io/badge/Python-3.14-243447.svg)](https://www.python.org/)
[![Django 5.2](https://img.shields.io/badge/Django-5.2-899783.svg)](https://www.djangoproject.com/)
[![React 18](https://img.shields.io/badge/React-18-B36B50.svg)](https://react.dev/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0%20InnoDB-243447.svg)](https://www.mysql.com/)
[![QR Verification](https://img.shields.io/badge/QR%20Passes-Dynamic%20In--Memory-899783.svg)](file:///docs/API_Documentation.md)
[![Tests Passing](https://img.shields.io/badge/Tests-42%2F42%20Passed-243447.svg)](file:///docs/Testing_Documentation.md)

An enterprise-grade, full-stack digital platform engineered to eliminate university library seat contention, modernize academic research spaces, enforce conflict-free desk reservation, and streamline physical library gate turnstile admittance using digital QR passes.

---

## 1. Project Overview & Motivation

In traditional campus libraries, students physically visit the library premises to check seat availability. During exam seasons and high-traffic study hours, this leads to long waiting lines, arguments over reserved seats, unmonitored desk hoarding, and inaccurate manual logbooks.

The **Smart Digital Library Slot Booking System** replaces manual registers with a centralized digital reservation and gate admittance platform. Students inspect seat availability in real time across multiple floors and zones, reserve dedicated study sessions, and receive digital cryptographic QR entry passes. Gate staff and librarians use camera turnstile scanners to admit students safely, while administrators retain comprehensive user lifecycle controls, seat inventory maintenance, and analytical capacity reporting.

---

## 2. Key Objectives & Highlights

1. **Digital Seat Reservation:** Replace physical logbooks with online desk booking.
2. **Interactive Live Seat Grid:** Visual color-coded desk representation:
   - 🟢 **Green / Emerald (`#22C55E`):** Available for reservation
   - 🟠 **Orange / Amber (`#F59E0B`):** Reserved by another student
   - 🔴 **Red / Rose (`#EF4444`):** Occupied or under maintenance/repair
   - 🔵 **Royal Blue (`#2563EB`):** Selected by user (with active glow ring)
3. **Atomic Concurrency Protection:** Employs Django ORM `transaction.atomic()` and MySQL InnoDB `select_for_update()` row-level locking to prevent race conditions and double bookings under concurrent student requests.
4. **Interval Mathematical Overlap Engine:** Uses interval comparison ($\max(\text{start}_1, \text{start}_2) < \min(\text{end}_1, \text{end}_2)$) rather than naive slot ID equality checks.
5. **Cryptographic QR Gate Turnstile Verification:**
   - **Zero Database Image Storage:** Raw credentials and QR PNG binaries are never stored in the database.
   - **Dynamic In-Memory Generation:** QR PNG images are generated in-memory on demand when an authorized student requests their pass.
   - **Preimage Resistant:** Database stores only the SHA-256 hash `token_hash`, per-pass `salt`, and `version`.
   - **Turnstile Scanner:** Camera scanner (`@zxing/browser`) with camera device switching, manual code fallback, synthesized Web Audio chimes, and photo ID cross-examination reminders.
   - **Concurrency Safe:** `select_for_update()` ensures duplicate turnstile scans are immediately rejected.
6. **Robust Admin User Lifecycle Controls:**
   - Full student activation/deactivation via secure PATCH API.
   - Immediate JWT token invalidation upon account deactivation (`is_active` lockstep).
   - Built-in self-deactivation protection, self-demotion protection, and last-admin safeguards.
7. **Role-Based Access Control (RBAC):** Three distinct roles:
   - `STUDENT`: Desk reservation, pass viewer, booking history, personal dossier.
   - `LIBRARIAN`: Gate QR scanner, admittance history audit, live floor inventory.
   - `ADMIN`: Full administrative control, user activation, desk & slot inventory, reports.
8. **Modern University Technology Platform Design System:**
   - Palette: Primary Royal Blue (`#2563EB`), Secondary Teal (`#14B8A6`), Accent Amber (`#F59E0B`), Light Background (`#F8FAFC`), Dark Background (`#0F172A`), Surface (`#FFFFFF` / `#1E293B`), Borders (`#E2E8F0` / `#334155`), Success (`#22C55E`), Error (`#EF4444`).
   - Typography: Inter (body / UI), Outfit (headings / display), Poppins (accents).
   - Micro-interactions & animations powered by Framer Motion.
   - Comprehensive Dark Mode toggle persisted across sessions.
9. **Demonstration Security:**
   - 1-click quick-fill demo credentials are built with `import.meta.env.DEV` guards, automatically tree-shaken and excluded from production builds.

---

## 3. Technology Stack

### Backend (100% Python)
- **Language:** Python 3.14 / 3.13 / 3.12 / 3.11
- **Framework:** Django 5.2 & Django REST Framework 3.18
- **Authentication:** Django REST Framework Simple JWT 5.5
- **ORM & Driver:** Django ORM with mysqlclient & PyMySQL (MySQL 8 connector)
- **QR Code Generation:** qrcode 8.0 & Pillow 10.0 (dynamic in-memory generation)
- **API Documentation:** drf-spectacular (OpenAPI 3.0 / Swagger UI / ReDoc)
- **Testing:** Django TestCase / APITestCase / TransactionTestCase (**42/42 tests passing on MySQL InnoDB**)

### Frontend
- **Framework:** React 18.3 & Vite 6
- **QR Scanner:** @zxing/browser & @zxing/library
- **Styling & Motion:** Tailwind CSS 3.4 & Framer Motion (Modern University Academic-Tech Theme + Complete Dark Mode)
- **Icons:** Lucide React
- **Routing:** React Router DOM 6.28
- **HTTP Client:** Axios with JWT request and refresh interceptors

### Database
- **RDBMS:** MySQL 8.0 (InnoDB Storage Engine)
- **Design:** Relational Third Normal Form (3NF) with foreign keys and compound indexes.

---

## 4. Directory & Folder Structure

```
Smart-Digital-Library-Slot-Booking/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── DigitalBookingPass.jsx       <-- Printable QR Entry Pass
│   │   │   ├── BookingCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ConfirmationModal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Login.jsx                    <-- Dev-mode guarded demo credentials
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── SeatAvailability.jsx
│   │   │   ├── BookSlot.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManageUsers.jsx              <-- User Activation / Deactivation
│   │   │   ├── ManageSeats.jsx
│   │   │   ├── ManageSlots.jsx
│   │   │   ├── ManageBookings.jsx
│   │   │   ├── GateScanner.jsx              <-- Turnstile Camera QR Scanner
│   │   │   ├── EntryHistory.jsx             <-- Gate Admittance Audit Log
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── accounts/                        <-- Custom User, RBAC, Admin APIs
│   │   ├── library/                         <-- Seats & TimeSlots
│   │   ├── bookings/                        <-- Concurrency & Overlap Engine
│   │   ├── checkin/                         <-- QR Passes & Turnstile Verification
│   │   ├── dashboard/                       <-- Telemetry & Reports
│   │   └── common/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── database/
│   ├── schema.sql                           <-- Full MySQL 8.0 DDL Schema
│   ├── sample_data.sql
│   ├── database_documentation.md
│   └── er_diagram.md
│
├── docs/
│   ├── Project_Overview.md
│   ├── Software_Requirements_Specification.md
│   ├── System_Architecture.md
│   ├── Database_Design.md
│   ├── API_Documentation.md
│   ├── Installation_Guide.md
│   ├── User_Manual.md
│   ├── Admin_Manual.md
│   └── Testing_Documentation.md
│
├── scripts/
│   ├── start-application.bat
│   ├── start-application.sh
│   └── database-setup.sql
│
├── PROJECT_STATUS.md
└── README.md
```

---

## 5. Quick Start Instructions (Local Windows / Linux)

### Step 1: Database Setup
Ensure MySQL 8.0 is running on `127.0.0.1:3306`, then run:
```bash
mysql -u root -p < scripts/database-setup.sql
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 127.0.0.1:8000
```

### Step 3: Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Access Points & Demo Credentials

| Resource | URL |
|---|---|
| **React Web Frontend** | http://localhost:5173 |
| **Gate QR Scanner Page** | http://localhost:5173/gate-scanner |
| **Django REST Backend** | http://127.0.0.1:8000/api/ |
| **Interactive Swagger UI Docs** | http://127.0.0.1:8000/api/docs/ |
| **Django Built-in Admin** | http://127.0.0.1:8000/admin/ |

### Demo Credentials for Academic Evaluation

| Role | Email | Default Password | Primary Capabilities |
|---|---|---|---|
| **Chief Administrator** | `admin@library.edu` | `AdminPassword@123` | Full admin dashboard, user activation, seat inventory, reports |
| **Gate Staff Librarian** | `librarian@library.edu` | `LibrarianPassword@123` | Turnstile QR camera scanner, admittance history, live floor inventory |
| **Student (Alex Turner)** | `alex.turner@student.edu` | `StudentPassword@123` | Student portal, seat booking, digital QR pass, profile |
| **Student (Priya Sharma)**| `priya.sharma@student.edu` | `StudentPassword@123` | Student portal, seat booking, digital QR pass |

*(Quick-fill buttons appear on `/login` in development mode. In production builds, quick-fill buttons are automatically excluded.)*

### How to Change Account Passwords
1. **Via Portal User Interface:** Log in to any account, navigate to **Account Profile** (`/profile`), and enter current password and new password under **Change Password**.
2. **Via Django Command Line (CLI):**
   ```bash
   cd backend
   python manage.py changepassword <email>
   ```
3. **Via Django Administrator Console:** Navigate to `http://127.0.0.1:8000/admin/` and update credentials securely.

---

## 7. Running the Automated Test Suite

```bash
cd backend
venv\Scripts\activate
python manage.py test apps.accounts.tests apps.library.tests apps.bookings.tests apps.checkin.tests --keepdb
```

**Results:** **42 passed / 42 tests (100% pass rate on MySQL 8.0 InnoDB in 32.5s)**:
- `test_concurrent_booking_only_one_succeeds`: 2 simultaneous student booking requests on the same seat & time window — exactly 1 succeeds, 1 blocked by MySQL row-level lock.
- `test_two_simultaneous_scans_only_one_succeeds`: 2 concurrent turnstile scans of the same QR pass — exactly 1 approved, 1 rejected.
- `test_cancellation_releases_seat_for_rebooking`: Immediate lock release and successful re-reservation.
- `test_previously_issued_tokens_rejected_after_deactivation`: JWT access token rejected as soon as admin sets student inactive.
- `test_qr_generation_after_booking_confirmation`: Verifies zero image data stored in MySQL database (`db_qr == ""`).
- `test_cancelled_booking_cannot_obtain_pass`: Cancelled bookings cannot generate or view passes.
- `test_expired_booking_cannot_obtain_pass`: Concluded past sessions cannot generate or view passes.

---

## 8. Sustainable Development Goals (SDG) Alignment

- **SDG 4 (Quality Education):** Provides equal, quiet, and reliable research spaces for all enrolled students.
- **SDG 9 (Industry, Innovation & Infrastructure):** Digitally modernizes educational campus infrastructure with QR verification.
- **SDG 11 (Sustainable Communities):** Optimizes the utilization of shared academic facilities and prevents seat hogging.
- **SDG 12 (Responsible Consumption & Production):** 100% paperless digital passes replace physical logbooks and paper tickets.
