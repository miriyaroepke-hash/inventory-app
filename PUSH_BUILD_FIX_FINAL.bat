@echo off
echo ==========================================
echo Pushing FINAL BUILD FIX (Unused Imports)...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Remove unused Menu and ShoppingCart icons from Navbar"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Build Fix Pushed!
pause
