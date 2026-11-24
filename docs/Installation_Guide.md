# Installation & Local Setup Guide
## Smart Digital Library Slot Booking System

This guide provides step-by-step instructions for running the complete full-stack application on a Windows local development environment (or Linux / macOS).

---

## 1. Prerequisites

Verify that the following development tools are installed on your workstation:
- **Python:** Version 3.10, 3.11, 3.12, 3.13, or 3.14 (`python --version`)
- **Node.js & npm:** Node.js v18+ and npm v9+ (`node --version`, `npm --version`)
- **MySQL Server:** MySQL 8.0+ running on port 3306 (or SQLite fallback)
- **Git** (optional)

---

## 2. Clone or Open Project

Open the root project directory in your terminal or Visual Studio Code:
```bash
cd "c:\Users\manis\Desktop\Library Booking system\Smart-Digital-Library-Slot-Booking"
```

---

## 3. Database Configuration

### Option A: MySQL 8.0 (Recommended for Production & Mini-Project Evaluation)
1. Ensure your MySQL server is running on `localhost:3306`.
2. Connect to MySQL and run the initialization script:
   ```bash
   mysql -u root -p < scripts/database-setup.sql
   ```
3. In `backend/.env`, set:
   ```env
   DB_ENGINE=mysql
   DB_NAME=smart_library_booking
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```

### Option B: SQLite (Quick Local Development)
In `backend/.env`, set:
```env
DB_ENGINE=sqlite
```

---

## 4. Backend Setup (Python Django REST Framework)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations to initialize database schema:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Populate realistic demonstration data (Admin, Students, 36 Desks, 4 Slots, Demo Bookings):
   ```bash
   python manage.py seed_demo_data
   ```
6. (Optional) Create a custom superuser:
   ```bash
   python manage.py createsuperuser
   ```
7. Start the backend development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
The backend API is now running on: **http://127.0.0.1:8000**  
Interactive Swagger API documentation is available at: **http://127.0.0.1:8000/api/docs/**

---

## 5. Frontend Setup (React Vite SPA)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
The React frontend application is now active at: **http://localhost:5173**

---

## 6. One-Click Launcher Scripts

To start both the backend and frontend simultaneously with a single click:
- **Windows:** Double-click or execute:
  ```cmd
  scripts\start-application.bat
  ```
- **Linux / macOS:** Execute:
  ```bash
  chmod +x scripts/start-application.sh
  ./scripts/start-application.sh
  ```

---

## 7. Demonstration Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Chief Administrator** | `admin@library.edu` | `AdminPassword@123` | Full Admin Console & Django Admin |
| **Student (Alex)** | `alex.turner@student.edu` | `StudentPassword@123` | Student Dashboard & Seat Booking |
| **Student (Priya)** | `priya.sharma@student.edu` | `StudentPassword@123` | Student Dashboard & Seat Booking |
