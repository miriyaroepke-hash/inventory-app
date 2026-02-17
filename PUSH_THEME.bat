@echo off
echo ==========================================
echo Pushing Pink Theme...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Theme: Soft Pink background and Black text"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Theme Updated!
echo Wait for Vercel to redeploy.
pause
