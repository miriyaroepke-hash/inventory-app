@echo off
echo ==========================================
echo Pushing Build Fixes (Lint Cleanup)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Remove unused imports causing build failures"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Build Fixes Pushed!
pause
