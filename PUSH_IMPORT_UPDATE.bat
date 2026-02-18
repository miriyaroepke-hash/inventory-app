@echo off
echo ==========================================
echo Pushing Import Fixes (Filter & Compression)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Import only positive stock and compress images"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Updates Pushed!
pause
