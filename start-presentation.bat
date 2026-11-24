@echo off
title Galgotias College Smart Library - Live Presentation Launcher
color 0B
echo ======================================================================
echo       GALGOTIAS COLLEGE SMART DIGITAL LIBRARY SLOT BOOKING
echo                 LIVE FACULTY PRESENTATION LAUNCHER
echo ======================================================================
echo.
echo [*] Step 1: Starting Django Backend Server (Port 8000)...
start "Django Backend [Port 8000]" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo [*] Step 2: Starting Vite React Frontend (Port 5173)...
start "Vite React Frontend [Port 5173]" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [*] Step 3: Launching Free Cloudflare Public HTTPS Tunnel...
echo.
echo ======================================================================
echo   COPY THE 'https://....trycloudflare.com' LINK BELOW
echo   AND SHARE IT WITH YOUR FACULTY / OPEN ON YOUR PHONE:
echo ======================================================================
echo.
npx --yes cloudflared tunnel --url http://localhost:5173
pause

