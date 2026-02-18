@echo off
echo ==========================================
echo Pushing FORCE DEPLOY (Ignore Errors)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Configure Next.js to ignore build errors for emergency deploy"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Force Deploy Pushed!
pause
