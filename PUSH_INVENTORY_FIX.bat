@echo off
echo ==========================================
echo Pushing Inventory Visibility Updates...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Hide zero stock items from inventory list"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Changes Live!
echo Auto-deployment should start on Vercel momentarily.
pause
