@echo off
echo ==========================================
echo Fix Database Deployment...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix database provider mismatch"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Now try Redeploy on Vercel.
pause
