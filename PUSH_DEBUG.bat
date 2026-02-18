@echo off
echo ==========================================
echo Pushing Debugging Tools...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Add Error Boundary to see crash details"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Debug Tools Pushed!
echo Wait 2 mins, then refresh the Orders page.
pause
