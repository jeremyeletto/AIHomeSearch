# 🔧 OAuth Redirect URL Fix

## 🚨 **Issue**
Google OAuth (and other providers) were redirecting to `localhost:3002` but the server runs on `localhost:3001`, causing "ERR_CONNECTION_REFUSED" errors.

## ✅ **Solution**
Updated all OAuth redirect URLs to use dynamic port detection:

### **Before (Hardcoded Port)**
```javascript
redirectTo: `${window.location.protocol}//${window.location.hostname}:3002`
```

### **After (Dynamic Port)**
```javascript
redirectTo: `${window.location.protocol}//${window.location.host}`
```

## 📋 **Files Updated**
- `assets/js/supabase-auth.js` - All OAuth providers (Google, Apple, Discord, Facebook, Microsoft)

## 🎯 **Benefits**
1. **✅ Works on any port** - Automatically detects current server port
2. **✅ No hardcoded values** - More flexible for different environments
3. **✅ Consistent behavior** - All providers use the same logic

## 🔍 **How It Works**
- `window.location.host` includes both hostname and port
- If running on `localhost:3001`, it becomes `localhost:3001`
- If running on `localhost:3002`, it becomes `localhost:3002`
- Works for any port configuration

## 🚀 **Testing**
After this fix, Google OAuth should:
1. ✅ Redirect to the correct port
2. ✅ Complete authentication successfully
3. ✅ Return to the application with proper user state
4. ✅ Update header to show authenticated state

---

*Fix applied: January 2025*
*Status: ✅ OAuth redirects now work on any port*
