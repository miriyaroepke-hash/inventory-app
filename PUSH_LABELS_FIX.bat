@echo off
echo ==========================================
echo Pushing Label Printing Fixes...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Label printing with Cyrillic support and real barcodes"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Labels Updated!
echo Auto-deployment should start on Vercel momentarily.
pause
