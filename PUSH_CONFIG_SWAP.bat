@echo off
echo ==========================================
echo Pushing CONFIG SWAP (.ts -> .mjs)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Switch to next.config.mjs to unblock build config"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Changes Pushed!
pause
