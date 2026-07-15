@echo off
echo ========================================
echo Live Location Tracker - Installation
echo ========================================
echo.

echo [1/6] Checking Node.js...
node --version || (
    echo ERROR: Node.js not found!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/6] Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)

echo [3/6] Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)

echo [4/6] Setting up environment files...
cd ..\server
if not exist .env copy .env.example .env
cd ..\client
if not exist .env copy .env.example .env

echo [5/6] Generating Prisma Client...
cd ..\server
call npx prisma generate

echo [6/6] Installation Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Edit server\.env with your database credentials
echo 2. Run: cd server ^&^& npx prisma migrate dev
echo 3. Start backend: cd server ^&^& npm run dev
echo 4. Start frontend: cd client ^&^& npm run dev
echo.
echo See README.md for detailed instructions
echo ========================================
pause