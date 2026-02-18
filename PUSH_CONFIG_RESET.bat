@echo off
echo ==========================================
echo Pushing CONFIG RESET (JS + v3.0)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Switch to standard next.config.js and bump version to v3.0"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Version 3.0 Pushed!
pause
