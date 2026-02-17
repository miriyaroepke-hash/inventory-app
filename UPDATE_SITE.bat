@echo off
echo ==========================================
echo Push Updates to GitHub...
echo ==========================================

..\PortableGit\cmd\git.exe add .
..\PortableGit\cmd\git.exe commit -m "Update homepage redirect"
..\PortableGit\cmd\git.exe push origin main

echo.
echo Update Sent!
echo Go to Vercel and it should auto-deploy (or click Redeploy).
pause
