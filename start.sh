#!/bin/bash
echo "================================================"
echo "  AI Health Assistant - Startup Script"
echo "================================================"

# Start backend
echo "[INFO] Starting Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "[WARNING] Created .env. Please add your GEMINI_API_KEY"
fi
python main.py &
BACKEND_PID=$!

cd ..

# Start frontend
echo "[INFO] Starting Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "================================================"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all services"

wait $BACKEND_PID $FRONTEND_PID
