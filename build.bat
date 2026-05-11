@echo off
cd /d "%~dp0"
echo === Running npm run build ===
call npm run build > build-output.log 2>&1
echo Exit code: %ERRORLEVEL%
echo Log saved to build-output.log
type build-output.log | more
pause
