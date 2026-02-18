@echo off
echo ==========================================
echo Pushing Import Credentials Update...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Allow entering credentials on import page"
..\PortableGit\cmd\git.exe push origin main

echo.
echo UI Updated!
pause
