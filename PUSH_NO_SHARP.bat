@echo off
echo ==========================================
echo Pushing SHARP DISABLE Test...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Disable strict Sharp dependency to check build"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Sharp Disabled Pushed!
pause
