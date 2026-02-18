@echo off
echo ==========================================
echo Pushing ISOLATION Test...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Remove potentially crashing icons and simplify UI"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Isolation Update Pushed!
pause
