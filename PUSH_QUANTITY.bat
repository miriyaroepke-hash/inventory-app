@echo off
echo ==========================================
echo Pushing Quantity Field...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Quantity field to product form"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Update Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
