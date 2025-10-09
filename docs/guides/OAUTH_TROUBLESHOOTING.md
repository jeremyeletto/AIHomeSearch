# 🔧 OAuth Redirect Troubleshooting Guide

## 🚨 **Issue Identified**

The logs show:
- ✅ Google sign-in is being initiated (`🔐 Google sign-in initiated`)
- ❌ Authentication state is not updating
- ❌ User remains signed out after OAuth attempt

This indicates the OAuth redirect is still not working properly.

## 🔍 **Troubleshooting Steps**

### **Step 1: Check Supabase Site URL**

1. **Go to**: https://supabase.com/dashboard/project/blreysdjzzildmekblfj/auth/settings
2. **Verify Site URL**:
   - Should be: `https://jeremyeletto.github.io/AIHomeSearch/`
   - NOT: `http://localhost:3000` or `http://localhost:3001`

3. **Verify Redirect URLs**:
   - Should include: `https://jeremyeletto.github.io/AIHomeSearch/**`
   - Remove any localhost entries

### **Step 2: Check Google Cloud Console**

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select your OAuth 2.0 Client ID**
3. **Verify Authorized redirect URIs**:
   - ✅ `https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback`
   - ✅ `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - ❌ Remove any `localhost:3000` or `localhost:3001` entries

### **Step 3: Test OAuth Flow Manually**

1. **Open Browser Developer Tools** (F12)
2. **Go to**: https://jeremyeletto.github.io/AIHomeSearch/
3. **Click "Sign In with Google"**
4. **Watch the Network tab** for redirects
5. **Check Console** for any errors

### **Step 4: Clear Browser Cache**

1. **Clear all browser data** for the site
2. **Try in incognito/private mode**
3. **Test authentication again**

## 🎯 **Expected OAuth Flow**

1. **User clicks "Sign In with Google"**
2. **Redirects to**: `https://accounts.google.com/oauth/authorize?...`
3. **User authenticates with Google**
4. **Google redirects to**: `https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback`
5. **Supabase processes authentication**
6. **Supabase redirects to**: `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
7. **Frontend receives authentication token**

## 🚨 **Common Issues**

### **Issue: Still redirecting to localhost**
**Solution**: 
- Check Supabase Site URL is set to GitHub Pages domain
- Verify Google Cloud Console redirect URIs
- Clear browser cache

### **Issue: "Invalid redirect URI" error**
**Solution**:
- Ensure exact match between Supabase and Google Console
- Check for typos in URLs
- Verify HTTPS vs HTTP

### **Issue: CORS errors**
**Solution**:
- Add `jeremyeletto.github.io` to allowed domains
- Check Supabase CORS settings

## 🔧 **Quick Fix Commands**

### **Test OAuth URL Manually**
```javascript
// Open browser console and run:
console.log('Testing OAuth URL...');
window.open('https://accounts.google.com/oauth/authorize?client_id=549560236821-jirt3lhg99bvbhu31fvsqu3hlh3k4rii.apps.googleusercontent.com&redirect_uri=https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback&response_type=code&scope=openid+email+profile');
```

### **Check Current Supabase Config**
```javascript
// In browser console:
console.log('Supabase URL:', window.CONFIG?.supabase?.url);
console.log('Supabase Key:', window.CONFIG?.supabase?.anonKey);
```

## 📋 **Verification Checklist**

- [ ] Supabase Site URL: `https://jeremyeletto.github.io/AIHomeSearch/`
- [ ] Supabase Redirect URLs: `https://jeremyeletto.github.io/AIHomeSearch/**`
- [ ] Google Authorized Redirect URIs: Both Supabase and GitHub Pages URLs
- [ ] Browser cache cleared
- [ ] Tested in incognito mode
- [ ] No console errors
- [ ] Network tab shows correct redirects

---

*Follow these steps to identify and fix the OAuth redirect issue!* 🚀
