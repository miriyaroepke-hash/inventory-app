@echo off
echo ==========================================
echo Pushing ReferenceError Fix...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Add missing icon imports to Navbar"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Pushed!
pause
