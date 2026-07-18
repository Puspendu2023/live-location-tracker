@echo off
echo ========================================
echo LiveTrack - API Keys Setup Guide
echo ========================================
echo.

echo REQUIRED APIs:
echo ===============
echo.
echo 1. Neon Database (REQUIRED)
echo    - Go to: https://neon.tech
echo    - Sign up with GitHub
echo    - Create project
echo    - Copy connection string
echo    - Paste in server\.env as DATABASE_URL
echo.
echo 2. JWT Secret (REQUIRED)
echo    - Run this command to generate:
echo    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo    - Copy output
echo    - Paste in server\.env as JWT_SECRET
echo.
echo.

echo OPTIONAL APIs:
echo ==============
echo.
echo 3. OpenCage Geocoding (Optional)
echo    - Go to: https://opencagedata.com/api
echo    - Sign up for free
echo    - Get API key from dashboard
echo    - Paste in server\.env as OPENCAGE_API_KEY
echo.
echo.

echo Generating JWT Secret...
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.
echo Copy the above code and use as JWT_SECRET
echo.

echo Opening Neon in browser...
start https://neon.tech

echo.
echo Press any key to open .env file for editing...
pause > nul

notepad server\.env

echo.
echo Done! Make sure you:
echo 1. Added DATABASE_URL from Neon
echo 2. Added JWT_SECRET (generated above)
echo 3. Added OPENCAGE_API_KEY (optional)
echo.
pause