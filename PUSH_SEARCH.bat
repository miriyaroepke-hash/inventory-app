@echo off
echo ==========================================
echo Pushing Search Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Search to Navbar"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Search Feature Live!
echo Auto-deployment should start on Vercel momentarily.
pause
