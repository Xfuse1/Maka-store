# Clean rebuild script for Next.js project
Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Removed .next" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Removed node_modules\.cache" -ForegroundColor Green
}

Write-Host "`nRebuilding project..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "`nYou can now run: pnpm dev" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}
