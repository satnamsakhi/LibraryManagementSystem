@echo off
TITLE Smart Digital Library Slot Booking System - Startup Launcher
COLOR 0B

echo ==============================================================================
echo       SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM (MCA MINI-PROJECT)
echo ==============================================================================
echo.

cd /d "%~dp0\.."

echo [1/3] Checking Python Backend Virtual Environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in backend\venv.
    echo Please run: python -m venv backend\venv and install requirements.txt
    pause
    exit /b 1
)

echo [2/3] Starting Django REST Framework Backend on http://127.0.0.1:8000 ...
start "SmartLib Backend (Django)" cmd /k "cd backend && venv\Scripts\activate && python manage.py migrate && python manage.py runserver 127.0.0.1:8000"

echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "SmartLib Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================================
echo All services are launching!
echo.
echo - React Frontend:       http://localhost:5173
echo - Django REST Backend:  http://127.0.0.1:8000
echo - Swagger OpenAPI Docs: http://127.0.0.1:8000/api/docs/
echo - Django Admin Panel:   http://127.0.0.1:8000/admin/
echo.
echo Demo Administrator: admin@library.edu / AdminPassword@123
echo Demo Student:       alex.turner@student.edu / StudentPassword@123
echo ==============================================================================
echo.
pause
