# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with your code
- MongoDB Atlas database (already configured)

## Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

## Step 2: Build and Test Locally
```bash
# Install dependencies
npm install

# Build the application
npm run build:vercel

# Test locally (optional)
npm start
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: finderskeepers
# - Directory: . (current directory)
# - Override settings? No
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

## Step 4: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Environment Variables
```
MONGODB_URI=mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/finderskeepers?retryWrites=true&w=majority
SESSION_SECRET=your-secure-session-secret-here
NODE_ENV=production
PUBLIC_ORIGIN=https://your-domain.vercel.app
```

### Optional Environment Variables
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SMTP_URL=your-smtp-url
MAIL_FROM=your-email
OPENAI_API_KEY=your-openai-key
ALLOW_DEV_AUTH=false
```

## Step 5: Update Domain Settings
After deployment:
1. Go to Project Settings → Domains
2. Your domain will be: `your-project-name.vercel.app`
3. Update `PUBLIC_ORIGIN` environment variable to your actual domain

## Step 6: Verify Deployment
1. Visit your deployed application
2. Test user registration
3. Test creating items
4. Verify database connectivity

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check TypeScript compilation: `npm run check`
- Verify build output: `npm run build:vercel`

### Runtime Issues
- Check environment variables in Vercel dashboard
- Verify MongoDB connection string
- Check function logs in Vercel dashboard

### Database Issues
- Ensure MongoDB Atlas allows access from anywhere (0.0.0.0/0)
- Verify database user permissions
- Check connection string format

## Production Considerations

### Security
- Generate a secure SESSION_SECRET
- Set ALLOW_DEV_AUTH=false
- Use HTTPS (automatic on Vercel)

### Performance
- Enable caching headers
- Optimize images
- Monitor function execution time

### Monitoring
- Set up Vercel Analytics
- Monitor MongoDB performance
- Set up error tracking

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] User registration works
- [ ] Database operations work
- [ ] File uploads work (if applicable)
- [ ] Email notifications work (if configured)
- [ ] Google OAuth works (if configured)
- [ ] All environment variables set
- [ ] Custom domain configured (if needed)

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. Ensure:

1. Your code is committed to GitHub
2. Environment variables are set in Vercel
3. Build process works correctly

## Support

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.mongodb.com/atlas
- Your deployed app logs: Vercel Dashboard → Functions → Logs
