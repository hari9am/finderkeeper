@echo off
setlocal enableextensions EnableDelayedExpansion
pushd %~dp0

REM Usage: run.bat [dev|prod]  (defaults to dev)
set MODE=%1
if "%MODE%"=="" set MODE=dev

REM Load .env if present (simple parser: KEY=VALUE, ignores blank and # comments)
if exist .env call :load_env

goto :run

:run
if /I "%MODE%"=="dev" goto :dev
if /I "%MODE%"=="prod" goto :prod
echo Unknown mode: %MODE%
goto :end

:dev
set NODE_ENV=development
if "%PORT%"=="" set PORT=5000
if "%SESSION_SECRET%"=="" set SESSION_SECRET=dev-secret-please-change
if "%DATABASE_URL%"=="" echo [WARN] DATABASE_URL not set. Please configure your database connection.
if "%REPL_ID%"=="" echo [WARN] REPL_ID not set. Auth will return 503.
if "%REPL_SECRET%"=="" echo [WARN] REPL_SECRET not set. Auth will return 503.
echo Starting development server on port %PORT%...
start "FindersKeepers Dev Server" cmd /c "npx --yes tsx server\index.ts"
echo Opening browser shortly...
timeout /t 8 /nobreak >nul
start "" "http://localhost:%PORT%/"
goto :end

:prod
set NODE_ENV=production
if "%PORT%"=="" set PORT=5000
if "%SESSION_SECRET%"=="" set SESSION_SECRET=prod-secret-please-change
if "%DATABASE_URL%"=="" echo [WARN] DATABASE_URL not set. Please configure your database connection.
echo Building frontend and backend...
npm run build
if errorlevel 1 goto :end
echo Starting production server on port %PORT%...
start "FindersKeepers Prod Server" cmd /c "node dist\index.js"
echo Opening browser shortly...
timeout /t 3 /nobreak >nul
start "" "http://localhost:%PORT%/"
goto :end

:load_env
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  set "_k=%%A"
  if defined _k if not "!_k:~0,1!"=="#" if not "!_k!"=="" (
    set "_v=%%B"
    if defined _v set "!_k!=!_v!"
  )
)
set _k=
set _v=
goto :eof

:end
popd
