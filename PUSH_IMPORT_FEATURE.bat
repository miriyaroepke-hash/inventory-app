@echo off
echo ==========================================
echo Pushing MoiSklad Import Feature...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: MoiSklad Import Feature (Web-based)"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Import Feature Deployed!
echo Wait 2-3 mins, then go to /admin/import
pause
