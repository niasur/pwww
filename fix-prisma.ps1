# Force Prisma Generate - PowerShell Script
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " FORCE PRISMA GENERATE" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Cleaning old files..." -ForegroundColor Green
try {
    if (Test-Path "node_modules\.prisma") {
        Remove-Item -Recurse -Force "node_modules\.prisma"
        Write-Host "✓ Removed old Prisma client" -ForegroundColor Green
    }
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next"
        Write-Host "✓ Removed .next cache" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Warning: Could not clean old files" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/5] Installing Prisma globally..." -ForegroundColor Green
try {
    npm install -g prisma@latest
    Write-Host "✓ Prisma installed globally" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install Prisma globally" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3/5] Clearing npm cache..." -ForegroundColor Green
try {
    npm cache clean --force
    Write-Host "✓ NPM cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Could not clear NPM cache" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Generating Prisma client..." -ForegroundColor Green
try {
    npx prisma generate --schema=./prisma/schema.prisma --force
    Write-Host "✓ Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Prisma generation failed!" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    try {
        npx prisma db push --force-reset
        npx prisma generate
        Write-Host "✓ Alternative method successful" -ForegroundColor Green
    } catch {
        Write-Host "✗ Alternative method also failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[5/5] Verifying installation..." -ForegroundColor Green
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "✅ SUCCESS: Prisma client found!" -ForegroundColor Green
    Write-Host "Location: node_modules\.prisma\client" -ForegroundColor Cyan
    Get-ChildItem "node_modules\.prisma\client" | Select-Object Name
} else {
    Write-Host "❌ ERROR: Prisma client NOT found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps required:" -ForegroundColor Yellow
    Write-Host "1. Delete node_modules folder" -ForegroundColor White
    Write-Host "2. Run: npm install" -ForegroundColor White
    Write-Host "3. Run: npx prisma generate" -ForegroundColor White
    Write-Host "4. Run: npm run db:push" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " PRISMA SETUP COMPLETE" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now run: npm run dev" -ForegroundColor Yellow
Read-Host "Press Enter to continue"