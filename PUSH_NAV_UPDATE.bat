@echo off
echo ==========================================
echo Pushing Navbar Update (Admin Link)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Admin Import link to Navbar"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Navbar Updated!
echo Please wait 3-5 minutes for deployment.
pause
