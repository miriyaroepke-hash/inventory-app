@echo off
echo ==========================================
echo Pushing Sales Cart Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Sales Cart & Checkout"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Sales Cart Live!
echo Auto-deployment should start on Vercel momentarily.
pause
