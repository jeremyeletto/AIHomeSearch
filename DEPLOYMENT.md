# Deployment Guide

This guide will help you deploy the AI Home Upgrades application to GitHub Pages with a Vercel backend.

## Prerequisites

- GitHub account
- Vercel account (free)
- AWS account with Bedrock access
- Realtor API key

## Step 1: Deploy Backend to Vercel

### 1.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 1.2 Deploy to Vercel
```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: ai-home-upgrades
# - Directory: ./
# - Override settings? N
```

### 1.3 Set Environment Variables in Vercel
Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables:
```
AWS_ACCESS_KEY_ID = your_aws_access_key
AWS_SECRET_ACCESS_KEY = your_aws_secret_key
AWS_DEFAULT_REGION = us-east-1
GEMINI_API_KEY = your_gemini_api_key
```

### 1.4 Get Your Vercel URL
After deployment, you'll get a URL like: `https://ai-home-upgrades-abc123.vercel.app`

## Step 2: Update Frontend Configuration

### 2.1 Update API Base URL
In `homes.html`, replace `your-vercel-app.vercel.app` with your actual Vercel URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' ? '' : 'https://your-actual-vercel-url.vercel.app';
```

### 2.2 Add Realtor API Key
In `homes.html`, find the Realtor API configuration and add your key:

```javascript
const REALTOR_API_KEY = 'your_actual_realtor_api_key';
```

## Step 3: Deploy to GitHub Pages

### 3.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 3.2 Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository"
3. Name it: `ai-home-upgrades`
4. Make it public
5. Don't initialize with README

### 3.3 Push to GitHub
```bash
git remote add origin https://github.com/yourusername/ai-home-upgrades.git
git branch -M main
git push -u origin main
```

### 3.4 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section
4. Source: "Deploy from a branch"
5. Branch: "main"
6. Folder: "/ (root)"
7. Click "Save"

### 3.5 Access Your Live Site
Your site will be available at:
`https://yourusername.github.io/ai-home-upgrades/homes.html`

## Step 4: Test Deployment

1. Visit your GitHub Pages URL
2. Test the API connectivity
3. Try generating an upgrade image
4. Check Vercel logs if there are issues

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure your Vercel deployment has the correct CORS headers in `server.js`.

### Environment Variables
Double-check that all environment variables are set correctly in Vercel.

### API Limits
- Vercel has usage limits on the free tier
- AWS Bedrock has usage limits
- Realtor API has rate limits

### Domain Configuration
You can add a custom domain to both Vercel and GitHub Pages if needed.

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth, 1000 serverless function invocations
- **GitHub Pages**: Free for public repositories
- **AWS Bedrock**: Pay per use (very affordable for testing)
- **Realtor API**: Check their pricing

## Security Notes

- Never commit API keys to GitHub
- Use environment variables for all sensitive data
- Consider adding rate limiting for production use
- Monitor usage and costs regularly
