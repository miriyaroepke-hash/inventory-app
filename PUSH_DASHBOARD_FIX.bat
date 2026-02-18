@echo off
echo ==========================================
echo Pushing Dashboard Reports...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Customize Dashboard (Russian, Admin Widgets)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Dashboard Updated!
echo Auto-deployment should start on Vercel momentarily.
pause
