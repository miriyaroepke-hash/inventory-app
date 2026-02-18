@echo off
echo ==========================================
echo Pushing Enhanced Order Forms...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Detailed order address and custom items"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Setup Complete!
echo Auto-deployment should start on Vercel momentarily.
pause
