@echo off
echo ==========================================
echo Pushing Rebranding (Dimmiani + Russian)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Rebranding: Dimmiani and full Russian translation"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Rebranding Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
