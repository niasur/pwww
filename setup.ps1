# Cat Grooming Service Setup Script
# Run in PowerShell as Administrator

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Cat Grooming Service Setup" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] Installing dependencies..." -ForegroundColor Green
try {
    npm install
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: npm install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/6] Creating environment file..." -ForegroundColor Green
try {
    "DATABASE_URL=`"file:./db/custom.db`"" | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env file created successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Failed to create .env file!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/6] Creating database folder..." -ForegroundColor Green
try {
    if (-not (Test-Path "db")) {
        New-Item -ItemType Directory -Path "db"
    }
    Write-Host "✓ Database folder created successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Failed to create db folder!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/6] Generating Prisma client..." -ForegroundColor Green
try {
    npx prisma generate
    Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Prisma generate failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[5/6] Setting up database..." -ForegroundColor Green
try {
    npm run db:push
    Write-Host "✓ Database setup completed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Database push failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[6/6] Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Cat Grooming Service Ready!" -ForegroundColor Yellow
Write-Host " Open: http://localhost:3000" -ForegroundColor White
Write-Host " WhatsApp: 628989878274" -ForegroundColor White
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

Read-Host "Press Enter to exit"