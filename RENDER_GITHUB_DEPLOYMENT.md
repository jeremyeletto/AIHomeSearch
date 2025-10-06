# 🚀 Production Deployment: Render + GitHub Pages

## 🎯 **Deployment Architecture**

```
┌─────────────────────────────────────┐
│        GitHub Pages Frontend        │
│    https://jeremyeletto.github.io/   │
│         AIHomeSearch/               │
│  • Static HTML/CSS/JS               │
│  • Supabase Client Integration     │
└─────────────┬───────────────────────┘
              │ HTTPS API Calls
              ▼
┌─────────────────────────────────────┐
│        Render Backend                │
│    https://your-app.onrender.com    │
│  • Node.js/Express Server           │
│  • AWS Bedrock Integration          │
│  • RapidAPI Integration             │
└─────────────┬───────────────────────┘
              │ API Calls
              ▼
┌─────────────────────────────────────┐
│        Supabase Production           │
│  • Authentication & User Management│
│  • Database (PostgreSQL)            │
│  • Storage (Images)                │
└─────────────────────────────────────┘
```

## 🔧 **Step 1: Deploy Backend to Render**

### **1.1 Prepare Backend for Render**

Create `render.yaml` for Render deployment:

```yaml
services:
  - type: web
    name: ai-home-upgrades-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_REGION
        value: us-east-1
      - key: GEMINI_API_KEY
        sync: false
      - key: RAPIDAPI_KEY
        sync: false
```

### **1.2 Deploy to Render**

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**
4. **Configure Service**:
   - **Name**: `ai-home-upgrades-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Starter` (free tier)

5. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `VITE_SUPABASE_URL`: Your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your production Supabase anon key
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: `us-east-1`
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `RAPIDAPI_KEY`: Your RapidAPI key

6. **Deploy**: Click "Create Web Service"

## 🔧 **Step 2: Deploy Frontend to GitHub Pages**

### **2.1 Update Frontend Configuration**

Update `assets/js/config.js` to use Render backend:

```javascript
const config = {
  // Production API endpoint (Render backend)
  apiBaseUrl: 'https://ai-home-upgrades-backend.onrender.com',
  
  supabase: {
    url: 'https://your-project-ref.supabase.co',
    anonKey: 'your-production-anon-key'
  },
  
  // Other configurations...
};
```

### **2.2 Update Supabase Redirect URLs**

1. **Go to Supabase Dashboard**
2. **Authentication → Settings**
3. **Update URLs**:
   - **Site URL**: `https://jeremyeletto.github.io/AIHomeSearch/`
   - **Redirect URLs**: 
     - `https://jeremyeletto.github.io/AIHomeSearch/**`
     - `https://jeremyeletto.github.io/AIHomeSearch/index.html`
     - `https://jeremyeletto.github.io/AIHomeSearch/homes.html`
     - `https://jeremyeletto.github.io/AIHomeSearch/my-images.html`
     - `https://jeremyeletto.github.io/AIHomeSearch/about.html`

### **2.3 Deploy to GitHub Pages**

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Production deployment: Render backend + GitHub Pages frontend"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`

3. **Wait for deployment** (2-3 minutes)

## 🔧 **Step 3: Production Supabase Setup**

### **3.1 Create Production Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Create new project**: `ai-home-upgrades-prod`
3. **Run production schema**: Copy from `production-supabase-schema.sql`

### **3.2 Configure OAuth Providers**

Enable and configure:
- ✅ Google OAuth
- ✅ Apple OAuth  
- ✅ Discord OAuth
- ✅ Facebook OAuth
- ✅ Microsoft OAuth

## 🔧 **Step 4: Update Frontend API Calls**

Update all API calls in frontend to use Render backend:

```javascript
// Example: Update image generation API call
const generateImage = async (imageData) => {
  const response = await fetch('https://ai-home-upgrades-backend.onrender.com/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAuth.getSession()?.access_token}`
    },
    body: JSON.stringify(imageData)
  });
  return response.json();
};
```

## 🔧 **Step 5: Testing Production Deployment**

### **5.1 Test Checklist**

- [ ] **Frontend loads**: https://jeremyeletto.github.io/AIHomeSearch/
- [ ] **Backend responds**: https://ai-home-upgrades-backend.onrender.com/health
- [ ] **Authentication works**: All OAuth providers
- [ ] **Image generation works**: AWS Bedrock integration
- [ ] **Property search works**: RapidAPI integration
- [ ] **Image storage works**: Supabase storage
- [ ] **Sign out works**: On all pages
- [ ] **Mobile responsive**: All screen sizes

### **5.2 Performance Testing**

- [ ] **Page load time**: < 3 seconds
- [ ] **API response time**: < 5 seconds
- [ ] **Image generation**: < 30 seconds
- [ ] **Mobile performance**: Acceptable on mobile

## 🚨 **Common Issues & Solutions**

### **Issue: CORS errors**
**Solution**: Add GitHub Pages domain to Render CORS settings

### **Issue: Supabase redirect errors**
**Solution**: Update Supabase redirect URLs with GitHub Pages domain

### **Issue: API calls failing**
**Solution**: Check Render environment variables and logs

### **Issue: Images not loading**
**Solution**: Verify Supabase storage policies and bucket configuration

## 📊 **Monitoring & Maintenance**

### **6.1 Render Monitoring**
- Check Render dashboard for service health
- Monitor logs for errors
- Set up uptime monitoring

### **6.2 GitHub Pages Monitoring**
- Check GitHub Actions for deployment status
- Monitor page load times
- Set up error tracking

### **6.3 Supabase Monitoring**
- Monitor database performance
- Check authentication logs
- Monitor storage usage

## 🎯 **Deployment Commands**

```bash
# 1. Prepare for deployment
git add .
git commit -m "Production deployment ready"

# 2. Push to GitHub (triggers GitHub Pages deployment)
git push origin main

# 3. Deploy backend to Render (via Render dashboard)
# - Connect GitHub repo
# - Configure environment variables
# - Deploy service
```

## ✅ **Post-Deployment Checklist**

- [ ] Frontend accessible at GitHub Pages URL
- [ ] Backend accessible at Render URL
- [ ] All OAuth providers working
- [ ] Image generation working
- [ ] Property search working
- [ ] Image storage working
- [ ] Mobile responsive
- [ ] Performance acceptable

---

*Ready to deploy? Start with Step 1: Deploy Backend to Render!* 🚀
