@echo off
echo ==========================================
echo Pushing User Name Support...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Name field to User and Register flow"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Name Support Live!
echo Auto-deployment should start on Vercel momentarily.
pause
