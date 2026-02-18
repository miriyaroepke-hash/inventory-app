@echo off
echo ==========================================
echo Pushing BUILD SCRIPT FIX...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Remove prisma db push from build script to unblock deployment"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Build Script Fixed!
pause
