@echo off
echo ==========================================
echo Pushing API Fix (Route Update)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Update api/orders/route.ts to match schema"
..\PortableGit\cmd\git.exe push origin main

echo.
echo API Fixed!
echo Please wait for deployment.
pause
