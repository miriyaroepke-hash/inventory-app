@echo off
echo ==========================================
echo Pushing Advanced Inventory Features...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Feat: Add Sort, Bulk Actions, Excel/PDF Export"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Advanced Features Live!
echo Auto-deployment should start on Vercel momentarily.
pause
