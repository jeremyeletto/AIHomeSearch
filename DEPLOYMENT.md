# Production Deployment Guide

## 🚀 Environment Setup

### Required Environment Variables

Create these environment variables in your production deployment platform:

```bash
# Required - Property Data API
RAPIDAPI_KEY=your_rapidapi_key_from_rapidapi

# Optional - AWS Bedrock (for AI generation)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key  
AWS_DEFAULT_REGION=us-east-1

# Optional - Server Configuration
PORT=3001
NODE_ENV=production
MODEL_PROVIDER=gemini
```

### 🔐 Getting API Keys

#### 1. RapidAPI Key (Required)
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to the **Realtor16 API**
3. Copy your API key from the dashboard
4. Set as `RAPIDAPI_KEY` environment variable

#### 2. AWS Credentials (Optional - for Bedrock AI)
1. Create AWS account
2. Configure AWS CLI: `aws configure`
3. Or set environment variables manually

## 🏗️ Deployment Platforms

### Option 1: Railway
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will auto-deploy on git push

### Option 2: Render
1. Connect GitHub repository to Render
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

### Option 3: Heroku
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Set environment variables:
   ```bash
   heroku config:set RAPIDAPI_KEY=your_key_here
   heroku config:set AWS_ACCESS_KEY_ID=your_key_here
   heroku config:set AWS_SECRET_ACCESS_KEY=your_key_here
   ```
4. Deploy: `git push heroku main`

### Option 4: Vercel (Frontend + Serverless)
1. Import GitHub repository
2. Configure environment variables in Vercel dashboard
3. Set build command: Uses package.json automatically

## 🔍 Troubleshooting Production Issues

### Property Loading Issues

**Error**: `Property API not configured - missing RAPIDAPI_KEY`

**Solution**: 
1. Check environment variables in your deployment platform
2. Verify RAPIDAPI_KEY is set correctly
3. Restart the server after adding variables

**Error**: `504 Gateway Timeout`

**Solution**:
1. Check if Realtor16 API is experiencing issues
2. Verify your RapidAPI subscription is active
3. Check rate limits in RapidAPI dashboard

### AI Generation Issues

**Error**: `AWS Bedrock not configured`

**Solution**:
1. Set AWS credentials environment variables
2. Verify AWS CLI is configured properly
3. Check Bedrock model access permissions

### Environment Validation

The server now validates environment variables on startup:

```
🔍 Validating environment variables...
✅ RAPIDAPI_KEY: 5b7fbff8...
⚠️ AWS_ACCESS_KEY_ID: Missing
🌍 Environment: production
🏠 Server port: 3001
```

## 🔒 Security Best Practices

1. **Never commit API keys to git**
2. Use environment variables for all secrets
3. Create `.env.example` (included) for team reference
4. Rotate API keys regularly
5. Use deployment platform secrets management

## 📊 Monitoring

Check server logs for:
- Environment variable validation
- API key configuration status  
- Rate limiting warnings
- Cache hit/miss rates
- Error patterns

## 🚨 Common Issues

1. **"Properties not loading"**
   - Check RAPIDAPI_KEY environment variable
   - Verify RapidAPI subscription is active

2. **"AI generation failing"**
   - Check AWS credentials
   - Verify Gemini API key is valid

3. **"Timeouts"**
   - Normal due to Realtor16 API limits
   - App includes retry and fallback logic

4. **"Rate limited"**
   - App handles automatically with caching
   - Consider upgrading RapidAPI plan for higher limits