@echo off
echo ====================================
echo  SUPER FIX - CAT GROOMING
echo ====================================
echo.

echo [STEP 1] COMPLETE CLEANUP...
if exist "node_modules" rmdir /s /q node_modules
if exist ".next" rmdir /s /q .next
if exist "db" rmdir /s /q db
if exist ".env" del .env
echo ✓ Cleanup completed

echo.
echo [STEP 2] CREATE ENVIRONMENT...
echo DATABASE_URL="file:./db/custom.db" > .env
if not exist "db" mkdir db
echo ✓ Environment created

echo.
echo [STEP 3] FRESH INSTALL...
call npm install
if %errorlevel% neq 0 (
    echo ✗ NPM INSTALL FAILED!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [STEP 4] PRISMA SETUP...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ✗ PRISMA GENERATE FAILED!
    echo Trying alternative...
    call npx prisma db push --force-reset
    call npx prisma generate
)
echo ✓ Prisma client generated

echo.
echo [STEP 5] DATABASE INIT...
call npm run db:push
if %errorlevel% neq 0 (
    echo ✗ DATABASE PUSH FAILED!
    pause
    exit /b 1
)
echo ✓ Database initialized

echo.
echo [STEP 6] VERIFICATION...
if exist "node_modules\.prisma\client\index.js" (
    echo ✓ PRISMA CLIENT VERIFIED!
) else (
    echo ✗ PRISMA CLIENT NOT FOUND!
    echo.
    echo Manual troubleshooting:
    echo 1. Delete node_modules folder
    echo 2. Run: npm install
    echo 3. Run: npx prisma generate
    echo 4. Run: npm run db:push
    pause
    exit /b 1
)

echo.
echo ====================================
echo  🐱 CAT GROOMING READY! 🐱
echo ====================================
echo.
echo  Open: http://localhost:3000
echo  WhatsApp: 628989878274
echo  Admin Password: admin123
echo.
echo  Starting server...
call npm run dev

pause