# 🔧 Authentication Issues & Solutions Documentation

## 📋 **Overview**

This document provides a comprehensive reference for authentication issues encountered during the AI Home Upgrades production deployment and their solutions. Use this as a troubleshooting guide for future authentication problems.

## 🚨 **Common Authentication Issues & Solutions**

### **Issue 1: OAuth Redirecting to Wrong Domain**

#### **Symptoms**
- OAuth redirects to `localhost:3000` or `localhost:3001` instead of production domain
- Authentication appears to work but user remains signed out
- Network events show incorrect redirect URLs

#### **Root Cause**
The OAuth redirect URLs in the application code were hardcoded to use localhost with port numbers, which don't work in production.

#### **Solution**
**File**: `assets/js/supabase-auth.js`

**Before (Broken)**:
```javascript
redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
```

**After (Fixed)**:
```javascript
redirectTo: `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`
```

**Why This Works**:
- Removes hardcoded port numbers
- Uses the actual path for GitHub Pages (`/AIHomeSearch/`)
- Works for both localhost and production domains

#### **Verification Steps**
1. Check network events in browser DevTools
2. Verify OAuth redirects to production domain
3. Confirm authentication state updates correctly

---

### **Issue 2: Supabase Site URL Configuration**

#### **Symptoms**
- OAuth redirects to wrong domain
- Authentication fails silently
- User data not loading

#### **Root Cause**
Supabase Site URL was set to localhost instead of production domain.

#### **Solution**
**Location**: Supabase Dashboard → Authentication → Settings

**Correct Configuration**:
- **Site URL**: `https://jeremyeletto.github.io/AIHomeSearch/`
- **Redirect URLs**: `https://jeremyeletto.github.io/AIHomeSearch/**`

**Remove**:
- Any `localhost:3000` or `localhost:3001` entries
- Any incorrect domain entries

---

### **Issue 3: OAuth Provider Redirect URIs**

#### **Symptoms**
- "Invalid redirect URI" errors
- OAuth providers reject authentication
- Authentication flow breaks

#### **Root Cause**
OAuth providers (Google, Apple, Discord, Facebook, Microsoft) were configured with localhost redirect URIs.

#### **Solution**
**For Each OAuth Provider**:

1. **Google Cloud Console**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select OAuth 2.0 Client ID
   - **Authorized redirect URIs**:
     - ✅ `https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback`
     - ✅ `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
     - ❌ Remove any localhost entries

2. **Apple Developer Console**:
   - Go to: https://developer.apple.com/account/
   - Navigate to: Certificates, Identifiers & Profiles → Identifiers
   - **Return URLs**: `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`

3. **Discord Developer Portal**:
   - Go to: https://discord.com/developers/applications
   - **OAuth2 → General**:
   - **Redirects**: `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`

4. **Facebook Developer Console**:
   - Go to: https://developers.facebook.com/
   - **Facebook Login → Settings**:
   - **Valid OAuth Redirect URIs**: `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`

5. **Azure Portal (Microsoft)**:
   - Go to: https://portal.azure.com/
   - **Azure Active Directory → App registrations**:
   - **Authentication → Redirect URIs**: `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`

---

### **Issue 4: Header Authentication State Not Updating**

#### **Symptoms**
- OAuth completes successfully
- User remains signed out in header
- Authentication state not reflecting correctly

#### **Root Cause**
Multiple issues can cause this:
1. OAuth redirects to wrong domain
2. Supabase configuration incorrect
3. Browser cache issues

#### **Solution**
1. **Fix OAuth redirects** (see Issue 1)
2. **Update Supabase configuration** (see Issue 2)
3. **Clear browser cache** and test in incognito mode
4. **Check browser console** for authentication errors

---

### **Issue 5: Sign Out Not Working on Index Page**

#### **Symptoms**
- Sign out works on other pages
- Sign out fails on index page (`/#`)
- Page doesn't reload after sign out

#### **Root Cause**
Simple redirect to `index.html` doesn't force page reload when already on index page.

#### **Solution**
**File**: `assets/js/header-component.js`

**Before (Broken)**:
```javascript
window.location.href = 'index.html';
```

**After (Fixed)**:
```javascript
window.location.reload();
```

**Why This Works**:
- Forces full page reload
- Clears authentication state
- Works on all pages including index

---

### **Issue 6: UI Overlap Making Sign Out Unclickable**

#### **Symptoms**
- Sign out button not clickable on index page
- Hero section content overlaps dropdown menu
- Z-index layering issues

#### **Root Cause**
CSS z-index conflicts between header dropdown and page content.

#### **Solution**
**File**: `assets/js/header-component.js`

**Add CSS Rules**:
```css
/* Header and dropdown (highest priority) */
.navbar { z-index: 1050 !important; }
.dropdown { z-index: 1055 !important; }
.dropdown-menu { z-index: 1060 !important; }

/* Hero section content (lower priority) */
.hero-section { z-index: 1 !important; }
.hero-content { z-index: 1 !important; }
.floating-element { z-index: 1 !important; }
```

---

## 🔍 **Troubleshooting Checklist**

### **When Authentication Issues Occur**

1. **Check OAuth Redirect URLs**:
   - Verify application code uses correct domain
   - Check Supabase Site URL configuration
   - Verify OAuth provider redirect URIs

2. **Test in Incognito Mode**:
   - Clear browser cache
   - Test fresh authentication flow
   - Check for cached redirects

3. **Monitor Network Events**:
   - Open browser DevTools
   - Watch OAuth redirect flow
   - Check for error responses

4. **Verify Supabase Configuration**:
   - Site URL points to production domain
   - Redirect URLs include production domain
   - OAuth providers enabled and configured

5. **Check Browser Console**:
   - Look for authentication errors
   - Verify Supabase client initialization
   - Check for CORS issues

---

## 📊 **Production URLs Reference**

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | https://jeremyeletto.github.io/AIHomeSearch/ | Main application |
| **Backend** | https://ai-home-upgrades-backend.onrender.com | API server |
| **Database** | https://supabase.com/dashboard/project/blreysdjzzildmekblfj | Supabase project |
| **Supabase Auth** | https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback | OAuth callback |

---

## 🚀 **Quick Fix Commands**

### **Test OAuth URL Manually**
```javascript
// In browser console:
console.log('Testing OAuth URL...');
window.open('https://accounts.google.com/oauth/authorize?client_id=549560236821-jirt3lhg99bvbhu31fvsqu3hlh3k4rii.apps.googleusercontent.com&redirect_uri=https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback&response_type=code&scope=openid+email+profile');
```

### **Check Current Supabase Config**
```javascript
// In browser console:
console.log('Supabase URL:', window.CONFIG?.supabase?.url);
console.log('Supabase Key:', window.CONFIG?.supabase?.anonKey);
```

### **Force Authentication State Update**
```javascript
// In browser console:
if (window.refreshHeader) {
    window.refreshHeader();
}
```

---

## 📚 **Key Files Modified**

1. **`assets/js/supabase-auth.js`**: OAuth redirect URL fixes
2. **`assets/js/header-component.js`**: Sign out functionality and z-index fixes
3. **`assets/js/config.js`**: Production API endpoint configuration
4. **Supabase Dashboard**: Site URL and redirect URL configuration
5. **OAuth Provider Consoles**: Redirect URI configuration

---

## 🎯 **Prevention Tips**

1. **Always test OAuth in incognito mode** during development
2. **Use environment variables** for different domains (localhost vs production)
3. **Monitor network events** during OAuth testing
4. **Keep OAuth provider configurations** in sync with Supabase settings
5. **Test authentication flow** on all pages, especially index page

---

*This documentation should help resolve most authentication issues encountered in the future.* 🚀
