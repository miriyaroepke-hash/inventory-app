@echo off
echo ==========================================
echo Pushing Sales History Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Sales History page & Rename Scan link"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Sales Feature Live!
echo Auto-deployment should start on Vercel momentarily.
pause
