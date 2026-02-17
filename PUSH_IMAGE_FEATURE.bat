@echo off
echo ==========================================
echo Pushing Image Upload Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Image Upload (Base64) and Mini Icons"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Feature Live!
echo Redeploying on Vercel...
pause
