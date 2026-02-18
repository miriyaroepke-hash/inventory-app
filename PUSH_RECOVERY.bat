@echo off
echo ==========================================
echo Pushing RECOVERY MODE...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Revert Navbar to simple HTML to bypass crash"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Recovery Mode Pushed!
pause
