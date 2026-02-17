@echo off
echo ==========================================
echo FINAL FIX for Deployment...
echo ==========================================

REM 1. Remove the folder physically
if exist "prisma\migrations" rmdir /s /q "prisma\migrations"

REM 2. Tell Git to remove the folder (if it tracks it)
..\PortableGit\cmd\git.exe rm -r --cached prisma/migrations

REM 3. Add all changes
..\PortableGit\cmd\git.exe add .

REM 4. Commit
..\PortableGit\cmd\git.exe commit -m "NUKE migrations lock file"

REM 5. Push
..\PortableGit\cmd\git.exe push origin main

echo.
echo DONE.
echo Please try to Redeploy on Vercel now.
pause
