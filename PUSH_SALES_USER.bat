@echo off
echo ==========================================
echo Pushing Sales User Column Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Seller Name column to Sales History"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Sales History Updated!
echo Auto-deployment should start on Vercel momentarily.
pause
