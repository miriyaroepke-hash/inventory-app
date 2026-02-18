@echo off
echo ==========================================
echo STARTING APP LOCALLY (Bypass Vercel Limit)
echo ==========================================

echo 1. Installing dependencies (this may take a minute)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b
)

echo.
echo 2. Syncing Database (Prisma)...
call npx prisma generate
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo Error syncing database.
    pause
    exit /b
)

echo.
echo 3. Starting the Server...
echo The app will open in your browser automatically.
echo Please wait for "Ready in..." message.
echo.
start http://localhost:3000

call npm run dev
pause
