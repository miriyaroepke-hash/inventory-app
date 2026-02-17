@echo off
echo ==========================================
echo FIX: Reverting to DATABASE_URL...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Use standard DATABASE_URL"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Please Redeploy on Vercel.
pause
