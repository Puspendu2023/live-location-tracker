@echo off
echo ========================================
echo LiveTrack - Status Check
echo ========================================
echo.

echo [1/4] Container Status:
docker-compose ps
echo.

echo [2/4] Testing Frontend (http://localhost:3000)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000
echo.

echo [3/4] Testing Backend API (http://localhost:5000)...
curl -s http://localhost:5000
echo.

echo [4/4] Testing Backend Health...
curl -s http://localhost:5000/api/health
echo.

echo ========================================
echo Access Points:
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Database: localhost:5432
echo.
echo View logs: docker-compose logs -f [service]
echo ========================================
pause