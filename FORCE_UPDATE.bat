@echo off
echo ==========================================
echo Force Update...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Force Update v2"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Update Sent!
echo Please wait for the NEW deployment on Vercel to finish.
pause
