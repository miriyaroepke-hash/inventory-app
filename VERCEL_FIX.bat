@echo off
echo ==========================================
echo FIX: Optimizing for Vercel...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Use Vercel recommended DB config"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Configuration Sent!
echo Please Redeploy on Vercel.
pause
