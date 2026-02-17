@echo off
echo ==========================================
echo Pushing Visual Fixes...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix dashboard text color in dark mode"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
