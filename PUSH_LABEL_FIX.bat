@echo off
echo ==========================================
echo Pushing Label Printing Fix...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Fix: Label printing encoding issues using html2canvas"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Auto-deployment should start on Vercel momentarily.
pause
