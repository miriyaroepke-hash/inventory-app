@echo off
echo ==========================================
echo Pushing Admin Control Updates...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Admin-only access and setup route"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Admin Controls Live!
echo Auto-deployment should start on Vercel momentarily.
pause
