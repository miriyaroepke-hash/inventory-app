@echo off
setlocal

echo Searching for git.exe...

rem Check common paths
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
) else if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_EXE=C:\Program Files\Git\bin\git.exe"
) else if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" (
    set "GIT_EXE=%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe"
) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_EXE=C:\Program Files (x86)\Git\cmd\git.exe"
) else (
    echo Git not found in common locations. Using default 'git' command.
    set "GIT_EXE=git"
)

echo Found git at: %GIT_EXE%
echo.
echo ==========================================
echo DEPLOYING TO VERCEL (Smart Git)
echo ==========================================
echo.

echo 1. Adding all changes...
"%GIT_EXE%" add .

echo.
echo 2. Committing changes (V3.1 Update)...
"%GIT_EXE%" commit -m "fix: Restore Postgres for Vercel & Dashboard V3.1"

echo.
echo 3. Pushing to origin main...
"%GIT_EXE%" push origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Push failed. Git might not be installed or authenticated.
    echo Please use VS Code Source Control -> Sync Changes manually.
) else (
    echo.
    echo SUCCESS! Changes pushed to Vercel.
    echo Wait 2-3 minutes for the site to update.
)

pause
