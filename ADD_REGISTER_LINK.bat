@echo off
echo ==========================================
echo FIX: Adding Register Link...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Add register link to login page"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo You can use the direct link /register while this updates.
pause
