# Install Dependencies Script

# For Windows PowerShell
Write-Host "Crypto Trading Chart - Dependency Installation" -ForegroundColor Green

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm installation
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "npm is not available. Please reinstall Node.js." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "Failed to install dependencies. Check the error messages above." -ForegroundColor Red
}
