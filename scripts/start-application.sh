#!/usr/bin/env bash
# ==============================================================================
# SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM - LINUX / MACOS STARTUP LAUNCHER
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================================================="
echo "      SMART DIGITAL LIBRARY SLOT BOOKING SYSTEM (MCA MINI-PROJECT)"
echo "=============================================================================="
echo ""

cd "$PROJECT_ROOT"

# Check Python environment
if [ ! -f "backend/venv/bin/python" ]; then
    echo "[!] Virtual environment not found in backend/venv."
    echo "Creating virtual environment..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

echo "[1/2] Launching Django REST Backend on http://127.0.0.1:8000..."
(
    cd backend
    source venv/bin/activate
    python manage.py migrate
    python manage.py runserver 127.0.0.1:8000
) &
BACKEND_PID=$!

echo "[2/2] Launching React Frontend on http://localhost:5173..."
(
    cd frontend
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "=============================================================================="
echo "All application servers launched successfully!"
echo "Press Ctrl+C to terminate both servers."
echo "=============================================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
