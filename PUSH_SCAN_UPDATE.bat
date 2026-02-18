@echo off
echo ==========================================
echo Pushing Scan Page Enhancements...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Scan Page Translations & Search by Name"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Scan Page Updated!
echo Auto-deployment should start on Vercel momentarily.
pause
