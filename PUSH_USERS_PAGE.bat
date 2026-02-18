@echo off
echo ==========================================
echo Pushing Users Management Page...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Users Management Page & Fix DB Provider"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Admin Feature Live!
echo Auto-deployment should start on Vercel momentarily.
pause
