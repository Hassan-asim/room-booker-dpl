@echo off
echo ========================================
echo  Meeting Room Booker - Quick Start
echo  Made by Sufi Hassan Asim
echo ========================================
echo.

echo [1/4] Checking if database is initialized...
if not exist "server\dev.db" (
    echo Database not found. Initializing...
    cd server
    call npx prisma db push
    call npx ts-node seed.ts
    cd ..
    echo Database initialized!
) else (
    echo Database already exists.
)

echo.
echo [2/4] Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

echo.
echo [3/4] Starting servers...
echo.
echo Starting Backend Server (Port 3000)...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 8080)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo [4/4] Servers starting...
echo.
echo ========================================
echo  Application is starting!
echo ========================================
echo.
echo  Frontend: http://localhost:8080
echo  Admin Panel: http://localhost:8080/admin
echo.
echo  Admin Credentials:
echo  Email: admin@dplit.com
echo  Password: 123456789
echo.
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Server*" /T /F

echo.
echo Servers stopped.
pause
