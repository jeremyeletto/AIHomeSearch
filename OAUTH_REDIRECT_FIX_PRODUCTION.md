# 🔧 Fix OAuth Redirect URLs in Supabase Production

## 🚨 **Issue Identified**

Your authentication is working (valid access token received), but OAuth is redirecting to `localhost:3000` instead of your production domain.

**Current Redirect**: `http://localhost:3000/#access_token=...`
**Should Redirect To**: `https://jeremyeletto.github.io/AIHomeSearch/#access_token=...`

## ✅ **Quick Fix (2 minutes)**

### **Step 1: Update Supabase Redirect URLs**

1. **Go to**: https://supabase.com/dashboard/project/blreysdjzzildmekblfj
2. **Navigate to**: Authentication → Settings
3. **Update URLs**:
   - **Site URL**: `https://jeremyeletto.github.io/AIHomeSearch/`
   - **Redirect URLs**: 
     ```
     https://jeremyeletto.github.io/AIHomeSearch/**
     https://jeremyeletto.github.io/AIHomeSearch/index.html
     https://jeremyeletto.github.io/AIHomeSearch/homes.html
     https://jeremyeletto.github.io/AIHomeSearch/my-images.html
     https://jeremyeletto.github.io/AIHomeSearch/about.html
     ```
4. **Remove old URLs**: Delete any `localhost:3000` or `localhost:3001` entries
5. **Save**: Click "Save" to apply changes

### **Step 2: Update OAuth Provider Settings**

For each OAuth provider (Google, Apple, Discord, Facebook, Microsoft):

1. **Go to**: Authentication → Providers
2. **Click on each provider** (Google, Apple, etc.)
3. **Update Redirect URLs** in each provider's settings:
   - Remove: `http://localhost:3000/**`
   - Add: `https://jeremyeletto.github.io/AIHomeSearch/**`
4. **Save** each provider

### **Step 3: Test Authentication**

1. **Go to**: https://jeremyeletto.github.io/AIHomeSearch/
2. **Click**: Sign In button
3. **Test**: Google OAuth (or any provider)
4. **Verify**: Redirects to GitHub Pages domain instead of localhost

## 🎯 **Expected Result**

After the fix:
- ✅ OAuth redirects to: `https://jeremyeletto.github.io/AIHomeSearch/#access_token=...`
- ✅ Authentication works on production
- ✅ User data loads correctly
- ✅ Sign out works properly

## 🚨 **Common Issues**

### **Issue: Still redirecting to localhost**
**Solution**: Clear browser cache and cookies, then test in incognito mode

### **Issue: OAuth provider errors**
**Solution**: Update redirect URLs in each OAuth provider's console (Google Cloud Console, etc.)

### **Issue: CORS errors**
**Solution**: Add GitHub Pages domain to Supabase CORS settings

## 📋 **Verification Checklist**

- [ ] Supabase Site URL updated to GitHub Pages domain
- [ ] All redirect URLs point to GitHub Pages domain
- [ ] OAuth providers updated with new redirect URLs
- [ ] Authentication works on production
- [ ] Sign out works on all pages
- [ ] User data displays correctly

---

*This should fix the OAuth redirect issue in 2 minutes!* 🚀
