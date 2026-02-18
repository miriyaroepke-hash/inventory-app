@echo off
echo ==========================================
echo Pushing Product Line Feature & Localization...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Product Line (Batch) & Inventory Localization"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Features Live!
echo Auto-deployment should start on Vercel momentarily.
pause
