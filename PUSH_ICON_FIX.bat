@echo off
echo ==========================================
echo Pushing ICON FIX (Database - Download)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Replace Database usage with Download in Navbar links"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Icon Fix Pushed!
pause
