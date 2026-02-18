@echo off
echo ==========================================
echo Pushing UI RESTORATION...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Restore full Orders UI with safety fixes"
..\PortableGit\cmd\git.exe push origin main

echo.
echo UI Restored!
pause
