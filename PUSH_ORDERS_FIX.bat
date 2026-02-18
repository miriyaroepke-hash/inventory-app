@echo off
echo ==========================================
echo Pushing Order Management System...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Order Management System (Orders, Kaspi, Returns, SDEK stub)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Orders Module Deployed!
echo Auto-deployment should start on Vercel momentarily.
pause
