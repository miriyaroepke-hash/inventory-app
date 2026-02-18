@echo off
echo ==========================================
echo Pushing VERSION MARKER (v2.0)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Add version marker to confirm deployment"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Version Marker Pushed!
pause
