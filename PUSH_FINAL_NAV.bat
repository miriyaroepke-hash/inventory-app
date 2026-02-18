@echo off
echo ==========================================
echo Pushing Final Navbar Restore...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Restore full Navbar UI"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Navbar Restored!
echo Wait 2 mins for everything to sync.
pause
