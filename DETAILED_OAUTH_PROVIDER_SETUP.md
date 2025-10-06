# 🔧 Detailed OAuth Provider Configuration Guide

## 📋 **Step 2: Update OAuth Providers - Detailed Instructions**

### **Google OAuth Provider**

1. **In Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/blreysdjzzildmekblfj
   - Navigate to: **Authentication → Providers**
   - Click on **"Google"** provider

2. **Update Google Provider Settings**:
   - **Enable**: Toggle "Enable Google provider" to ON
   - **Client ID**: Keep your existing Google Client ID
   - **Client Secret**: Keep your existing Google Client Secret
   - **Redirect URL**: Update to `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Save**: Click "Save" button

3. **Update Google Cloud Console** (if needed):
   - Go to: https://console.cloud.google.com/
   - Navigate to: **APIs & Services → Credentials**
   - Click on your OAuth 2.0 Client ID
   - **Authorized redirect URIs**: Add `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Remove**: Any `localhost:3000` or `localhost:3001` entries
   - **Save**: Click "Save"

### **Apple OAuth Provider**

1. **In Supabase Dashboard**:
   - Go to: **Authentication → Providers**
   - Click on **"Apple"** provider

2. **Update Apple Provider Settings**:
   - **Enable**: Toggle "Enable Apple provider" to ON
   - **Client ID**: Keep your existing Apple Client ID
   - **Client Secret**: Keep your existing Apple Client Secret
   - **Redirect URL**: Update to `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Save**: Click "Save" button

3. **Update Apple Developer Console** (if needed):
   - Go to: https://developer.apple.com/account/
   - Navigate to: **Certificates, Identifiers & Profiles → Identifiers**
   - Select your App ID
   - **Services**: Enable "Sign In with Apple"
   - **Domains and Subdomains**: Add `jeremyeletto.github.io`
   - **Return URLs**: Add `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`

### **Discord OAuth Provider**

1. **In Supabase Dashboard**:
   - Go to: **Authentication → Providers**
   - Click on **"Discord"** provider

2. **Update Discord Provider Settings**:
   - **Enable**: Toggle "Enable Discord provider" to ON
   - **Client ID**: Keep your existing Discord Client ID
   - **Client Secret**: Keep your existing Discord Client Secret
   - **Redirect URL**: Update to `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Save**: Click "Save" button

3. **Update Discord Developer Portal** (if needed):
   - Go to: https://discord.com/developers/applications
   - Select your application
   - Navigate to: **OAuth2 → General**
   - **Redirects**: Add `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Remove**: Any `localhost:3000` or `localhost:3001` entries
   - **Save**: Click "Save Changes"

### **Facebook OAuth Provider**

1. **In Supabase Dashboard**:
   - Go to: **Authentication → Providers**
   - Click on **"Facebook"** provider

2. **Update Facebook Provider Settings**:
   - **Enable**: Toggle "Enable Facebook provider" to ON
   - **Client ID**: Keep your existing Facebook App ID
   - **Client Secret**: Keep your existing Facebook App Secret
   - **Redirect URL**: Update to `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Save**: Click "Save" button

3. **Update Facebook Developer Console** (if needed):
   - Go to: https://developers.facebook.com/
   - Select your app
   - Navigate to: **Facebook Login → Settings**
   - **Valid OAuth Redirect URIs**: Add `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Remove**: Any `localhost:3000` or `localhost:3001` entries
   - **Save**: Click "Save Changes"

### **Microsoft OAuth Provider**

1. **In Supabase Dashboard**:
   - Go to: **Authentication → Providers**
   - Click on **"Microsoft"** provider

2. **Update Microsoft Provider Settings**:
   - **Enable**: Toggle "Enable Microsoft provider" to ON
   - **Client ID**: Keep your existing Microsoft Client ID
   - **Client Secret**: Keep your existing Microsoft Client Secret
   - **Redirect URL**: Update to `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Save**: Click "Save" button

3. **Update Azure Portal** (if needed):
   - Go to: https://portal.azure.com/
   - Navigate to: **Azure Active Directory → App registrations**
   - Select your application
   - Navigate to: **Authentication**
   - **Redirect URIs**: Add `https://jeremyeletto.github.io/AIHomeSearch/auth/callback`
   - **Remove**: Any `localhost:3000` or `localhost:3001` entries
   - **Save**: Click "Save"

## 🔍 **Verification Steps**

After updating each provider:

1. **Test Authentication**:
   - Go to: https://jeremyeletto.github.io/AIHomeSearch/
   - Click "Sign In"
   - Test each OAuth provider
   - Verify redirects to GitHub Pages domain

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any OAuth errors
   - Verify successful authentication

3. **Verify User Data**:
   - Check if user profile loads correctly
   - Verify sign out functionality works

## 🚨 **Common Issues & Solutions**

### **Issue: "Invalid redirect URI" error**
**Solution**: Make sure the redirect URI in both Supabase and the OAuth provider console match exactly

### **Issue: "App not configured" error**
**Solution**: Verify the OAuth provider is enabled in Supabase and the app is properly configured

### **Issue: CORS errors**
**Solution**: Add `jeremyeletto.github.io` to allowed domains in OAuth provider settings

## 📋 **Quick Checklist**

- [ ] Google OAuth: Updated in Supabase + Google Cloud Console
- [ ] Apple OAuth: Updated in Supabase + Apple Developer Console
- [ ] Discord OAuth: Updated in Supabase + Discord Developer Portal
- [ ] Facebook OAuth: Updated in Supabase + Facebook Developer Console
- [ ] Microsoft OAuth: Updated in Supabase + Azure Portal
- [ ] All redirect URIs point to GitHub Pages domain
- [ ] All localhost entries removed
- [ ] Authentication tested on production

---

*Follow these detailed steps to ensure all OAuth providers work correctly in production!* 🚀
