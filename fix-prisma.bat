@echo off
echo ====================================
echo  FORCE PRISMA GENERATE
echo ====================================
echo.

echo [1/4] Cleaning old Prisma files...
if exist "node_modules\.prisma" rmdir /s /q node_modules\.prisma
if exist ".next" rmdir /s /q .next

echo.
echo [2/4] Installing Prisma globally...
call npm install -g prisma@latest

echo.
echo [3/4] Generating Prisma client...
call npx prisma generate --schema=./prisma/schema.prisma

echo.
echo [4/4] Verifying generation...
if exist "node_modules\.prisma\client" (
    echo ✓ Prisma client generated successfully!
    echo.
    echo Location: node_modules\.prisma\client
    dir node_modules\.prisma\client
) else (
    echo ✗ ERROR: Prisma client generation failed!
    echo.
    echo Trying alternative method...
    call npx prisma db push --force-reset
    call npx prisma generate
)

echo.
echo ====================================
echo  PRISMA SETUP COMPLETE
echo ====================================
pause