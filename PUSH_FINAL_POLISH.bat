@echo off
echo ==========================================
echo Pushing FINAL POLISH...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Remove unused top-level constants in API"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Final Code Pushed!
pause
