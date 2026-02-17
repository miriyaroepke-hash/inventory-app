@echo off
echo ==========================================
echo Fix Database Deployment (Final Attempt)...
echo ==========================================

REM Delete the lock file causing the issue
if exist "prisma\migrations\migration_lock.toml" del "prisma\migrations\migration_lock.toml"
if exist "prisma\migrations" rmdir /s /q "prisma\migrations"

REM Configure Git
..\PortableGit\cmd\git.exe config user.email "admin@inventory.app"
..\PortableGit\cmd\git.exe config user.name "Inventory Admin"

REM Stage the deletions
..\PortableGit\cmd\git.exe add .

REM Commit
..\PortableGit\cmd\git.exe commit -m "Remove conflicting migration files"

REM Push
..\PortableGit\cmd\git.exe push origin main

echo.
echo Fix Sent!
echo Please go to Vercel and click Redeploy one last time.
pause
