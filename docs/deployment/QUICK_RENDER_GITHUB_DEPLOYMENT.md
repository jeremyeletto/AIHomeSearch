# ⚡ Quick Start: Render + GitHub Pages Deployment

## 🎯 **Your Production Setup**

- **Frontend**: [https://jeremyeletto.github.io/AIHomeSearch/](https://jeremyeletto.github.io/AIHomeSearch/)
- **Backend**: `https://ai-home-upgrades-backend.onrender.com` (to be deployed)
- **Database**: Supabase Production

## 🚀 **30-Minute Deployment**

### **Step 1: Deploy Backend to Render (15 minutes)**

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**: Select your `AIHomeFiles` repo
4. **Configure Service**:
   - **Name**: `ai-home-upgrades-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Starter` (free tier)

5. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   GEMINI_API_KEY=your-gemini-api-key
   RAPIDAPI_KEY=your-rapidapi-key
   ```

6. **Deploy**: Click "Create Web Service"
7. **Wait**: 5-10 minutes for deployment

### **Step 2: Setup Production Supabase (10 minutes)**

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name: `ai-home-upgrades-prod`
   - Choose region closest to your users

2. **Run Database Schema**:
   - Go to SQL Editor
   - Copy contents from `production-supabase-schema.sql`
   - Click "Run"

3. **Configure Authentication**:
   - Go to Authentication → Settings
   - **Site URL**: `https://jeremyeletto.github.io/AIHomeSearch/`
   - **Redirect URLs**: `https://jeremyeletto.github.io/AIHomeSearch/**`

4. **Enable OAuth Providers**:
   - Go to Authentication → Providers
   - Enable Google, Apple, Discord, Facebook, Microsoft
   - Configure each with your OAuth credentials

### **Step 3: Deploy Frontend to GitHub Pages (5 minutes)**

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Production deployment: Render backend + GitHub Pages frontend"
   git push origin main
   ```

2. **Enable GitHub Pages** (if not already enabled):
   - Go to repository settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`

3. **Wait**: 2-3 minutes for deployment

## ✅ **Testing Checklist**

- [ ] **Frontend loads**: https://jeremyeletto.github.io/AIHomeSearch/
- [ ] **Backend responds**: https://ai-home-upgrades-backend.onrender.com/health
- [ ] **Authentication works**: All OAuth providers
- [ ] **Image generation works**: AWS Bedrock integration
- [ ] **Property search works**: RapidAPI integration
- [ ] **Image storage works**: Supabase storage
- [ ] **Sign out works**: On all pages
- [ ] **Mobile responsive**: All screen sizes

## 🚨 **Common Issues**

### **Issue: CORS errors**
**Solution**: Add GitHub Pages domain to Render CORS settings

### **Issue: Supabase redirect errors**
**Solution**: Update Supabase redirect URLs with GitHub Pages domain

### **Issue: API calls failing**
**Solution**: Check Render environment variables and logs

## 🎯 **Automated Deployment**

Run the automated script:

```bash
./deploy-render-github.sh
```

This will guide you through the entire process!

## 📊 **Monitoring**

- **Render Dashboard**: Monitor backend health and logs
- **GitHub Pages**: Monitor frontend deployment status
- **Supabase Dashboard**: Monitor database and authentication

---

*Ready to deploy? Start with Step 1: Deploy Backend to Render!* 🚀
