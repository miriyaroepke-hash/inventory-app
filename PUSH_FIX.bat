@echo off
echo ==========================================
echo Pushing Fix for Inventory Page...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Restore missing state variables in Inventory page"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
