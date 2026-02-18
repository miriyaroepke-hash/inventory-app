@echo off
echo ==========================================
echo Pushing SDEK Integration Updates...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: SDEK Integration (City Search, Waybill Draft)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo SDEK Features Live!
echo Auto-deployment should start on Vercel momentarily.
pause
