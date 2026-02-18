@echo off
echo ==========================================
echo FORCE PUSHING CHANGES...
echo ==========================================
echo This will overwrite the remote version with your local version.

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Emergency: Force push to sync deployment"
..\PortableGit\cmd\git.exe push --force origin main

echo.
echo Force Push Complete.
echo Please check if Vercel starts a new building.
pause
