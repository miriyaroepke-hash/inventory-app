@echo off
echo ==========================================
echo DEPLOYING TO VERCEL (Git Push)
echo ==========================================
echo.
echo This script will send the latest changes (Postgres, Dashboard, Kaspi)
echo to the remote repository (GitHub/Vercel).
echo.
echo Make sure you have internet access.
echo.

echo 1. Adding all changes...
git add .

echo.
echo 2. Committing changes (V3.1 Update)...
git commit -m "fix: Restore Postgres for Vercel & Dashboard V3.1"

echo.
echo 3. Pushing to origin main...
git push origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Push failed. Git might not be in your PATH or authentication failed.
    echo Please use VS Code Source Control if this fails.
) else (
    echo.
    echo SUCCESS! Changes pushed to Vercel.
    echo Wait 2-3 minutes for the site to update.
)

pause
