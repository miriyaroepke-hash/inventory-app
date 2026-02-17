@echo off
echo ==========================================
echo Pushing Localization (Russian + Tenge)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Localization: Russian menu and Tenge currency"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Updates Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
