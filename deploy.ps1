# PowerShell deployment script for Vercel

Write-Host "🚀 Deploying FindersKeepers to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Blue
npm run build:vercel

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix build errors before deploying." -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📝 Don't forget to set environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   - MONGODB_URI" -ForegroundColor White
Write-Host "   - SESSION_SECRET" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor White
Write-Host "   - PUBLIC_ORIGIN=https://your-domain.vercel.app" -ForegroundColor White
