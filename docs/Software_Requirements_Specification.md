# Software Requirements Specification (SRS)
## Smart Digital Library Slot Booking System

---

## 1. Introduction

### 1.1 Purpose
This document provides the complete specification of requirements for the Smart Digital Library Slot Booking System, intended for MCA academic evaluation and development guidance.

### 1.2 Scope of the System
The system is a centralized web application allowing students to query real-time library desk availability, book dedicated time slots, receive booking references, and manage cancellations. Administrators manage seats, operational schedules, student permissions, and review analytics.

---

## 2. Overall Description

### 2.1 User Classes and Characteristics
1. **Student (End User):** Registered university student holding active enrollment status. Can view seats, make reservations, cancel bookings, and update their personal profile.
2. **Administrator (Staff / Librarian):** Library administration personnel responsible for seat configurations, floor maintenance, scheduling time windows, account activations, and cancellation audits.

### 2.2 Operating Environment
- Client: Any modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari) supporting ES6+ and modern CSS.
- Server: Python 3.10+ runtime, Django 5.x web server, MySQL 8.0 server on Windows or Linux.

---

## 3. Functional Requirements

### Module 1: User Authentication & Profile
- **FR-1.1:** System shall permit students to register using unique email, student ID, department, and a secure password (minimum 8 characters).
- **FR-1.2:** System shall authenticate users via email and password, issuing standard JWT `access` (1 day validity) and `refresh` (7 days validity) tokens.
- **FR-1.3:** System shall reject authentication attempts by deactivated or inactive student accounts.
- **FR-1.4:** Authenticated users shall be able to view profile data, update department/phone, and change their password.

### Module 2: Seat & Time Slot Management
- **FR-2.1:** System shall record seat codes, floor designations, library sections/zones, and seat types (Regular Desk, Computer Workstation, Discussion Pod, Silent Cubicle).
- **FR-2.2:** Administrators shall be able to toggle desk maintenance status (`is_under_maintenance`), marking the seat immediately unavailable without deleting historic records.
- **FR-2.3:** Administrators shall configure daily time slots with validated start and end times (duration between 30 minutes and 8 hours).
- **FR-2.4:** Deletion of a seat or slot shall be rejected if active upcoming reservations are linked to that resource.

### Module 3: Booking & Concurrency Engine
- **FR-3.1:** System shall permit authenticated students to select a calendar date, time slot, and operational seat to place a reservation.
- **FR-3.2:** System shall prevent reservations for past dates or past time slots on the current day.
- **FR-3.3:** **Atomic Overlap Guard:** System shall execute an atomic transaction using InnoDB row-level locking (`SELECT ... FOR UPDATE`) on the seat record.
- **FR-3.4:** System shall reject the booking if the seat has an existing `CONFIRMED` reservation overlapping in time on the requested date:
  $$\max(\text{start}_1, \text{start}_2) < \min(\text{end}_1, \text{end}_2)$$
- **FR-3.5:** System shall reject the booking if the student already holds an existing `CONFIRMED` reservation overlapping in time on that date.
- **FR-3.6:** Successful reservations shall generate an alphanumeric reference code: `LIB-YYYYMMDD-XXXX`.
- **FR-3.7:** Students may cancel their own confirmed reservations. Upon cancellation, the seat status is released immediately for other users.
- **FR-3.8:** Students shall be prevented from cancelling another student's reservation.

### Module 4: Administrative Telemetry & Controls
- **FR-4.1:** System shall display high-level dashboard metrics: total registered users, active desks, maintenance count, today's confirmed reservations, today's utilization percentage, and cancellation counts.
- **FR-4.2:** System shall allow administrators to search, activate, or deactivate student accounts.
- **FR-4.3:** System shall prevent administrators from deactivating their own administrative account or removing the final active administrator.

---

## 4. Non-Functional Requirements

1. **Performance:** Desk availability search and booking queries must return within 300ms under standard local workloads.
2. **Data Integrity:** Enforce foreign key constraints (`ON DELETE RESTRICT` for booked resources; `ON DELETE CASCADE` for user reservations).
3. **Security:** Passwords hashed using PBKDF2 with SHA-256 algorithm. Private REST endpoints protected by JWT bearer token authorization. CORS strictly configured.
4. **Usability:** Responsive layout conforming to modern design standards (Navy blue, white, light slate) using Tailwind CSS.
