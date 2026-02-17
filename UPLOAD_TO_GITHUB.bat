@echo off
echo ==========================================
echo Uploading code to GitHub...
echo ==========================================
echo.
echo If a window pops up asking for username/password, please enter your GitHub credentials.
echo.

REM Configure Git if not already configured
..\PortableGit\cmd\git.exe config user.email "admin@inventory.app"
..\PortableGit\cmd\git.exe config user.name "Inventory Admin"

REM Add all files
..\PortableGit\cmd\git.exe add .

REM Commit (if there are changes)
..\PortableGit\cmd\git.exe commit -m "Initial upload"

REM Ensure branch is main
..\PortableGit\cmd\git.exe branch -M main

REM Push
..\PortableGit\cmd\git.exe push -u origin main

echo.
if %errorlevel% neq 0 (
    echo.
    echo Upload failed! Please check the error message above.
    echo Common reasons:
    echo 1. Incorrect GitHub username/password.
    echo 2. Repository does not exist.
    echo.
) else (
    echo.
    echo Upload SUCCESSFUL!
    echo Now go to Vercel and import this repository.
)
pause
