#!/bin/bash

echo "🚀 Deploying FindersKeepers to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the application
echo "🔨 Building application..."
npm run build:vercel

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - SESSION_SECRET"
echo "   - NODE_ENV=production"
echo "   - PUBLIC_ORIGIN=https://your-domain.vercel.app"
