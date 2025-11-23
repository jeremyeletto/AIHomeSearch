# 🎨 Google OAuth Branding Setup Guide

## 🎯 **Goal: Change Google Sign-in to Show "AIHomeSearch"**

The Google OAuth consent screen currently shows:
```
Sign in
to continue to blreysdjzzildmekblfj.supabase.co
```

We want it to show:
```
Sign in
to continue to AIHomeSearch
```

---

## 🔧 **Solution: Update Google Cloud Console**

### **Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (associated with OAuth client ID: `549560236821-jirt3lhg99bvbhu31fvsqu3hlh3k4rii`)

### **Step 2: Navigate to OAuth Consent Screen**
1. In the left navigation menu, go to **APIs & Services** → **OAuth consent screen**
2. You should see your application listed

### **Step 3: Edit Application Name**
1. Click **Edit App** or **Configure Consent Screen**
2. Look for the **"App name"** field
3. Change the value to: `AIHomeSearch`
4. Fill in other required fields:
   - **User support email**: `your-email@domain.com`
   - **Developer contact information**: `your-email@domain.com`
5. Click **Save and Continue**

### **Step 4: Complete Setup Steps**
Go through the remaining steps:
- **Scopes**: Review and continue
- **Test users**: Add test users if needed
- **Summary**: Review and finish

---

## ⚠️ **Important Notes**

### **Domain vs App Name:**
- **Domain**: `blreysdjzzildmekblfj.supabase.co` (cannot be changed - this is your Supabase domain)
- **App Name**: `AIHomeSearch` (can be changed - this is what users see)

### **What Users Will See:**
```
Sign in
to continue to AIHomeSearch
```

The domain `blreysdjzzildmekblfj.supabase.co` will still be used internally by Google for the OAuth flow, but users will see the friendly "AIHomeSearch" name.

---

## 🚀 **Alternative: Custom Domain (Advanced)**

If you want to show a completely custom domain, you would need to:

1. **Set up a custom domain** in Supabase
2. **Update OAuth redirect URIs** to use the custom domain
3. **Update Google Cloud Console** with new redirect URIs

**Example custom domain setup:**
```
https://auth.aihomeupgrades.com/auth/v1/callback
```

But this requires additional DNS configuration and Supabase custom domain setup.

---

## 🎯 **Recommended Approach**

**For now, just update the App Name to "AIHomeSearch"** - this is the simplest solution that will make the OAuth screen much more user-friendly without requiring complex domain setup.

The changes should take effect within a few minutes after saving in Google Cloud Console.

---

## 📋 **Quick Checklist**

- [ ] Access Google Cloud Console
- [ ] Navigate to OAuth consent screen
- [ ] Edit App name to "AIHomeSearch"
- [ ] Fill in required fields (support email, developer contact)
- [ ] Save and continue through all steps
- [ ] Test the sign-in flow

After completing these steps, users will see "AIHomeSearch" instead of the Supabase domain on the Google sign-in screen! 🚀







