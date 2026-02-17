@echo off
echo ==========================================
echo FIX: Using POSTGRES_URL directly...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Switch to POSTGRES_URL"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Please Redeploy on Vercel one last time.
pause
