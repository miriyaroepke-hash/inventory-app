@echo off
echo ==========================================
echo FORCE PUSHING ALL UPDATES
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Force update of all features (Sales User, Inventory Hide, Scan Page)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo ==========================================
echo All modules updated! 
echo Please wait 2-3 minutes for Vercel to redeploy.
echo ==========================================
pause
