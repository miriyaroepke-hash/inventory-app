@echo off
echo ==========================================
echo Pushing Orders Crash Fix...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Handle API errors and Date hydration in Orders"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Pushed!
echo Please wait for deployment.
pause
