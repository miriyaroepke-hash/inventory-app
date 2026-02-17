@echo off
echo ==========================================
echo Pushing Russian Translation...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Translate menu to Russian"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Translation Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
