# 🚀 Production Deployment Guide

## 📋 **Deployment Overview**

This guide covers deploying the AI Home Upgrades application to production with:
- ✅ Supabase Authentication (Google, Apple, Discord, Facebook, Microsoft)
- ✅ Image Storage & Management
- ✅ Address Storage & Property Data
- ✅ Header Authentication System
- ✅ All Bug Fixes & Improvements

## 🎯 **Production Architecture**

```
┌─────────────────────────────────────┐
│        Production Frontend          │
│    (Vercel/Netlify Hosting)        │
│  • React/HTML/CSS/JS               │
│  • Supabase Client Integration     │
└─────────────┬───────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│        Supabase Backend             │
│  • Authentication & User Management│
│  • Database (PostgreSQL)            │
│  • Real-time Subscriptions         │
│  • Storage (Images)                │
└─────────────┬───────────────────────┘
              │ API Calls
              ▼
┌─────────────────────────────────────┐
│        External APIs                │
│  • AWS Bedrock (AI Image Gen)       │
│  • Google Gemini (AI)               │
│  • RapidAPI (Property Data)         │
└─────────────────────────────────────┘
```

## 🔧 **Step 1: Supabase Production Setup**

### **1.1 Create Production Supabase Project**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and project name: `ai-home-upgrades-prod`
4. Set strong database password
5. Choose region closest to your users
6. Wait for project creation (2-3 minutes)

### **1.2 Configure Authentication**
1. **Go to**: Authentication → Settings
2. **Site URL**: `https://your-domain.com`
3. **Redirect URLs**: 
   - `https://your-domain.com/**`
   - `https://your-domain.com/index.html`
   - `https://your-domain.com/homes.html`
   - `https://your-domain.com/my-images.html`
   - `https://your-domain.com/about.html`

### **1.3 Enable OAuth Providers**
1. **Go to**: Authentication → Providers
2. **Enable each provider**:
   - ✅ Google (requires Google Cloud Console setup)
   - ✅ Apple (requires Apple Developer setup)
   - ✅ Discord (requires Discord Developer setup)
   - ✅ Facebook (requires Facebook Developer setup)
   - ✅ Microsoft (requires Azure AD setup)

### **1.4 Database Schema Setup**
Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_images table
CREATE TABLE generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_image_url TEXT,
  generated_image_url TEXT,
  prompt TEXT,
  upgrade_type TEXT,
  property_address TEXT,
  property_price INTEGER,
  property_bedrooms INTEGER,
  property_bathrooms INTEGER,
  property_sqft INTEGER,
  generation_status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own images" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true);

-- Create storage policies
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔧 **Step 2: Image Storage Configuration**

### **2.1 Supabase Storage Setup**
1. **Go to**: Storage → Settings
2. **Configure bucket**: `generated-images`
3. **Set policies**: Users can upload/view/delete their own images
4. **Enable CDN**: For faster image delivery

### **2.2 Alternative: AWS S3 Setup**
If you prefer AWS S3 for image storage:

1. **Create S3 Bucket**:
   - Bucket name: `ai-home-upgrades-images-prod`
   - Region: Same as your app
   - Public access: Configured for web hosting

2. **Configure CORS**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

3. **Set up CloudFront CDN** (optional but recommended)

## 🔧 **Step 3: Environment Variables**

### **3.1 Production Environment File**
Create `.env.production`:

```env
# Supabase Production
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# AWS Bedrock (Production)
AWS_ACCESS_KEY_ID=your-production-aws-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret
AWS_REGION=us-east-1

# Google Gemini (Production)
GEMINI_API_KEY=your-production-gemini-key

# RapidAPI (Production)
RAPIDAPI_KEY=your-production-rapidapi-key

# Production Settings
NODE_ENV=production
PORT=3000
```

### **3.2 Update Client Configuration**
Update `assets/js/config.js`:

```javascript
const config = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'your-production-anon-key'
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },
  rapidapi: {
    key: process.env.RAPIDAPI_KEY
  }
};
```

## 🔧 **Step 4: Hosting Platform Setup**

### **4.1 Vercel Deployment (Recommended)**

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Create vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "AWS_ACCESS_KEY_ID": "@aws-access-key",
    "AWS_SECRET_ACCESS_KEY": "@aws-secret-key",
    "GEMINI_API_KEY": "@gemini-api-key",
    "RAPIDAPI_KEY": "@rapidapi-key"
  }
}
```

3. **Deploy**:
```bash
vercel --prod
```

### **4.2 Netlify Deployment (Alternative)**

1. **Create netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Deploy via Netlify Dashboard**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

## 🔧 **Step 5: Domain & SSL Configuration**

### **5.1 Custom Domain Setup**
1. **Purchase domain** (if not already owned)
2. **Configure DNS**:
   - A record: `@` → Vercel/Netlify IP
   - CNAME: `www` → your-domain.com

### **5.2 SSL Certificate**
- **Vercel**: Automatic SSL via Let's Encrypt
- **Netlify**: Automatic SSL via Let's Encrypt
- **Custom**: Use Cloudflare or AWS Certificate Manager

## 🔧 **Step 6: Production Testing Checklist**

### **6.1 Authentication Testing**
- [ ] Google OAuth works
- [ ] Apple OAuth works
- [ ] Discord OAuth works
- [ ] Facebook OAuth works
- [ ] Microsoft OAuth works
- [ ] Sign out works on all pages
- [ ] User data displays correctly

### **6.2 Image Generation Testing**
- [ ] AWS Bedrock image generation works
- [ ] Google Gemini image generation works
- [ ] Images save to Supabase Storage
- [ ] Images display correctly
- [ ] Image download works

### **6.3 Property Data Testing**
- [ ] Property search works
- [ ] Property data loads correctly
- [ ] Image carousel works
- [ ] Pagination works

### **6.4 Performance Testing**
- [ ] Page load times < 3 seconds
- [ ] Image generation < 30 seconds
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🚨 **Security Considerations**

### **7.1 Environment Variables**
- ✅ Never commit `.env` files to Git
- ✅ Use hosting platform environment variables
- ✅ Rotate API keys regularly
- ✅ Use least-privilege access

### **7.2 Database Security**
- ✅ Row Level Security enabled
- ✅ Proper RLS policies
- ✅ Regular backups
- ✅ Monitor for suspicious activity

### **7.3 API Security**
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration
- ✅ HTTPS only

## 📊 **Monitoring & Analytics**

### **8.1 Error Tracking**
- **Sentry**: For error monitoring
- **LogRocket**: For user session replay
- **Supabase**: Built-in logging

### **8.2 Performance Monitoring**
- **Vercel Analytics**: Built-in performance metrics
- **Google Analytics**: User behavior tracking
- **Core Web Vitals**: Performance monitoring

## 🎯 **Next Steps**

1. **Start with Supabase setup** (Step 1)
2. **Configure image storage** (Step 2)
3. **Set up environment variables** (Step 3)
4. **Deploy to hosting platform** (Step 4)
5. **Configure domain** (Step 5)
6. **Test everything** (Step 6)

---

*Ready to deploy? Let's start with Step 1: Supabase Production Setup!* 🚀
