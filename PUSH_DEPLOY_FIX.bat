@echo off
echo ==========================================
echo Pushing Critical Deployment Fix...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Run database migration during build"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Pushed!
echo Please wait 2-3 minutes for Vercel to rebuild.
pause
