@echo off
echo ==========================================
echo Pushing Build Safety Fix (Removing Database Icon)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Replace Database icon with Download to fix build"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Safety Fix Pushed!
pause
