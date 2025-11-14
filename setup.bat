@echo off
echo ====================================
echo  Cat Grooming Service Setup
echo ====================================
echo.

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Creating environment file...
echo DATABASE_URL="file:./db/custom.db" > .env
if %errorlevel% neq 0 (
    echo ERROR: Failed to create .env file!
    pause
    exit /b 1
)

echo.
echo [3/6] Creating database folder...
if not exist "db" mkdir db
if %errorlevel% neq 0 (
    echo ERROR: Failed to create db folder!
    pause
    exit /b 1
)

echo.
echo [4/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo [5/6] Setting up database...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Database push failed!
    pause
    exit /b 1
)

echo.
echo [6/6] Starting development server...
echo.
echo ====================================
echo  Cat Grooming Service Ready!
echo  Open: http://localhost:3000
echo  WhatsApp: 628989878274
echo ====================================
echo.
call npm run dev

pause