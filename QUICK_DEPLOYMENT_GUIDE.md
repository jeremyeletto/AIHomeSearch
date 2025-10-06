# 🚀 Quick Start: Production Deployment

## ⚡ **Fast Track Deployment (30 minutes)**

### **Step 1: Supabase Production Setup (10 minutes)**

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name: `ai-home-upgrades-prod`
   - Choose region closest to your users
   - Set strong password

2. **Run Database Schema**:
   - Go to SQL Editor in Supabase
   - Copy and paste contents from `production-supabase-schema.sql`
   - Click "Run" to execute

3. **Configure Authentication**:
   - Go to Authentication → Settings
   - Site URL: `https://your-domain.vercel.app` (we'll get this after deployment)
   - Redirect URLs: `https://your-domain.vercel.app/**`

4. **Enable OAuth Providers**:
   - Go to Authentication → Providers
   - Enable Google, Apple, Discord, Facebook, Microsoft
   - Configure each with your OAuth credentials

### **Step 2: Environment Variables (5 minutes)**

1. **Copy Template**:
   ```bash
   cp production-env-template.txt .env.production
   ```

2. **Fill in Values**:
   - Supabase URL: From your Supabase project settings
   - Supabase Anon Key: From your Supabase project settings
   - AWS credentials: Your production AWS keys
   - Gemini API Key: Your production Google API key
   - RapidAPI Key: Your production RapidAPI key

### **Step 3: Deploy to Vercel (10 minutes)**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   vercel env add GEMINI_API_KEY
   vercel env add RAPIDAPI_KEY
   ```

### **Step 4: Update Supabase Redirect URLs (5 minutes)**

1. **Get your Vercel URL**:
   - Go to Vercel dashboard
   - Copy your deployment URL

2. **Update Supabase**:
   - Go to Authentication → Settings
   - Update Site URL and Redirect URLs with your Vercel URL

## 🎯 **Automated Deployment**

Run the automated deployment script:

```bash
./deploy-production.sh
```

This script will guide you through the entire process!

## ✅ **Post-Deployment Checklist**

- [ ] Authentication works (all OAuth providers)
- [ ] Sign out works on all pages
- [ ] Image generation works
- [ ] Property search works
- [ ] Images save and load correctly
- [ ] Mobile responsiveness
- [ ] Performance is acceptable

## 🚨 **Common Issues & Solutions**

### **Issue: OAuth redirects not working**
**Solution**: Update Supabase redirect URLs with your production domain

### **Issue: Images not uploading**
**Solution**: Check Supabase storage policies and bucket configuration

### **Issue: API calls failing**
**Solution**: Verify all environment variables are set correctly in Vercel

### **Issue: Slow performance**
**Solution**: Enable Supabase CDN and optimize images

## 📞 **Need Help?**

1. Check the full deployment guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
2. Review Supabase documentation
3. Check Vercel deployment logs
4. Test locally with production environment variables

---

*Ready to deploy? Start with Step 1!* 🚀
