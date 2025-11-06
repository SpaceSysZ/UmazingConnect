# School Social App - Backend Setup Script (PowerShell)
Write-Host "Setting up School Social App Backend..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item "env-template.txt" ".env.local"
    Write-Host "Created .env.local - Please update the database credentials if needed" -ForegroundColor Green
}

# Start database
Write-Host "Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if database is ready
$maxAttempts = 30
$attempt = 0
do {
    try {
        docker exec school-app-db pg_isready -U postgres | Out-Null
        Write-Host "Database is ready!" -ForegroundColor Green
        break
    } catch {
        $attempt++
        if ($attempt -ge $maxAttempts) {
            Write-Host "Database failed to start after $maxAttempts attempts" -ForegroundColor Red
            exit 1
        }
        Write-Host "Still waiting for database... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($attempt -lt $maxAttempts)

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Create uploads directory
Write-Host "Creating uploads directory..." -ForegroundColor Yellow
if (-not (Test-Path "public/uploads")) {
    New-Item -ItemType Directory -Path "public/uploads" -Force | Out-Null
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your database credentials if needed" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see your app" -ForegroundColor White
Write-Host ""
Write-Host "Database management:" -ForegroundColor Cyan
Write-Host "- pgAdmin: http://localhost:8080 (admin@school.com / admin)" -ForegroundColor White
Write-Host "- Direct connection: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "To stop the database: docker-compose down" -ForegroundColor Yellow