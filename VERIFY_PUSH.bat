@echo off
echo ==========================================
echo DIAGNOSTIC PUSH...
echo ==========================================

echo Current Remote:
..\PortableGit\cmd\git.exe remote -v

echo.
echo Attempting Verbose Push...
..\PortableGit\cmd\git.exe push -v origin main

echo.
if %errorlevel% neq 0 (
    echo.
    echo PUSH FAILED!
    echo Please take a screenshot of this window.
) else (
    echo.
    echo PUSH SUCCESSFUL! 
    echo Please check Vercel now.
)
pause
