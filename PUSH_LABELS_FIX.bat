@echo off
echo ==========================================
echo Pushing Label Adjustments...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Adjust label layout (smaller font, shorter barcode)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Labels Tuned!
echo Auto-deployment should start on Vercel momentarily.
pause
