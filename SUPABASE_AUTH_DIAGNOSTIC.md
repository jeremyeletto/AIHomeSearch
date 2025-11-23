# 🔍 Supabase Authentication Diagnostic Guide

## Quick Diagnostic Test

### Step 1: Check Browser Console
1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for these messages:

**✅ GOOD - You should see:**
```
✅ Supabase Auth initialized successfully
🔄 SupabaseAuth: Auth state change event: SIGNED_IN
👤 User authenticated: true
```

**❌ BAD - Common errors:**
```
❌ Failed to initialize Supabase Auth: [error]
Error getting session: [error]
Invalid API key
CORS error
```

---

## Common Authentication Issues

### Issue 1: "Failed to initialize Supabase Auth"

**Symptoms:**
- Console shows: `❌ Failed to initialize Supabase Auth`
- User cannot sign in
- Authentication buttons don't work

**Possible Causes:**
1. **Invalid Supabase URL or API Key**
2. **Supabase client not loaded** (script loading order issue)
3. **CORS errors** (wrong domain configuration)

**Solution:**
1. Check `assets/js/supabase-auth.js` line 16-18:
   ```javascript
   this.supabase = createClient(
       'https://blreysdjzzildmekblfj.supabase.co',  // Your Supabase URL
       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'   // Your anon key
   );
   ```

2. **Verify in Supabase Dashboard:**
   - Go to: https://app.supabase.com → Your Project → Settings → API
   - Check **Project URL** matches the code
   - Check **anon/public key** matches the code

3. **Check Script Loading Order:**
   Make sure in your HTML files, scripts load in this order:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/js/config.js"></script>
   <script src="assets/js/supabase-auth.js"></script>
   ```

---

### Issue 2: "Error getting session"

**Symptoms:**
- Console shows: `Error getting session: [error]`
- User appears signed out even when signed in
- Session doesn't persist

**Possible Causes:**
1. **Cookies/localStorage blocked** (browser privacy settings)
2. **Session expired** (token refresh failed)
3. **Domain mismatch** (Supabase Site URL wrong)

**Solution:**
1. **Check Supabase Site URL:**
   - Go to: Supabase Dashboard → Authentication → URL Configuration
   - **Site URL** should be: `https://homeupgrades.xyz` (or your domain)
   - **Redirect URLs** should include: `https://homeupgrades.xyz/**`

2. **Check Browser Settings:**
   - Disable ad blockers temporarily
   - Allow cookies for your domain
   - Try incognito mode to test

3. **Clear Browser Storage:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   // Then refresh page
   ```

---

### Issue 3: OAuth Sign-In Fails

**Symptoms:**
- Click "Sign in with Google" → nothing happens
- OAuth redirects to wrong URL
- "Invalid redirect URI" error

**Possible Causes:**
1. **OAuth provider not configured** in Supabase
2. **Redirect URLs don't match** between Supabase and OAuth provider
3. **OAuth provider credentials missing**

**Solution:**

1. **Check Supabase OAuth Settings:**
   - Go to: Supabase Dashboard → Authentication → Providers
   - Ensure Google (and other providers) are **Enabled**
   - Check **Client ID** and **Client Secret** are set

2. **Check OAuth Provider Redirect URIs:**
   
   **For Google:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID
   - **Authorized redirect URIs** must include:
     - `https://blreysdjzzildmekblfj.supabase.co/auth/v1/callback`
     - `https://homeupgrades.xyz/auth/callback` (if using custom domain)

   **For Other Providers:**
   - Same pattern: redirect URI must match Supabase callback URL

3. **Check Code in `supabase-auth.js`:**
   The redirect URL logic should detect your domain correctly:
   ```javascript
   const currentHost = window.location.hostname;
   let redirectUrl;
   
   if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
       redirectUrl = 'https://homeupgrades.xyz/';
   } else {
       redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
   }
   ```

---

### Issue 4: User Signed In But Can't Access Data

**Symptoms:**
- Authentication appears successful
- User can sign in
- But queries to database fail (500 errors)
- "Permission denied" errors

**Possible Causes:**
1. **RLS policies not set up** (we just fixed this!)
2. **User ID mismatch** (auth.uid() doesn't match user_id in table)
3. **Session token invalid**

**Solution:**
1. **Verify RLS is set up:**
   - Run `verify-rls-setup.sql` in Supabase SQL Editor
   - Should show 4 policies exist

2. **Check User ID:**
   ```javascript
   // In browser console:
   console.log('User ID:', window.supabaseAuth?.getCurrentUser()?.id);
   ```

3. **Test Query:**
   ```sql
   -- In Supabase SQL Editor (while signed in):
   SELECT auth.uid(), COUNT(*) 
   FROM generated_images 
   WHERE user_id = auth.uid();
   ```

---

### Issue 5: Authentication State Not Updating in UI

**Symptoms:**
- User signs in successfully
- But header still shows "Sign In" button
- Navigation doesn't update

**Possible Causes:**
1. **Event listeners not working**
2. **Header component not initialized**
3. **Race condition** (auth initializes before header)

**Solution:**
1. **Check Event Listeners:**
   ```javascript
   // In browser console:
   document.addEventListener('authStateChanged', (e) => {
       console.log('Auth state changed:', e.detail);
   });
   ```

2. **Force Refresh:**
   ```javascript
   // In browser console:
   if (window.supabaseAuth) {
       window.supabaseAuth.onAuthStateChange(window.supabaseAuth.getCurrentUser());
   }
   ```

3. **Check Header Component:**
   - Verify `header-component.js` is loaded
   - Check it listens for `authStateChanged` event

---

## Diagnostic Script

Run this in your browser console to diagnose issues:

```javascript
// Copy and paste this entire block into browser console

console.log('🔍 SUPABASE AUTH DIAGNOSTIC');
console.log('========================');

// 1. Check if Supabase library is loaded
console.log('1. Supabase Library:', typeof supabase !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// 2. Check if auth instance exists
console.log('2. Auth Instance:', window.supabaseAuth ? '✅ Exists' : '❌ Missing');

if (window.supabaseAuth) {
    // 3. Check initialization
    console.log('3. Initialized:', window.supabaseAuth.isInitialized ? '✅ Yes' : '❌ No');
    
    // 4. Check authentication status
    console.log('4. Authenticated:', window.supabaseAuth.isAuthenticated() ? '✅ Yes' : '❌ No');
    
    // 5. Get current user
    const user = window.supabaseAuth.getCurrentUser();
    console.log('5. Current User:', user ? `✅ ${user.email}` : '❌ None');
    
    // 6. Check Supabase client
    console.log('6. Supabase Client:', window.supabaseAuth.supabase ? '✅ Exists' : '❌ Missing');
    
    if (window.supabaseAuth.supabase) {
        // 7. Check session
        window.supabaseAuth.supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.log('7. Session Error:', '❌', error.message);
            } else if (data.session) {
                console.log('7. Session:', '✅ Valid', data.session.user.email);
            } else {
                console.log('7. Session:', '❌ No session');
            }
        });
    }
} else {
    console.log('❌ Cannot continue - Auth instance not found');
}

// 8. Check configuration
console.log('8. Config:', window.CONFIG ? '✅ Loaded' : '❌ Missing');

// 9. Check current URL
console.log('9. Current URL:', window.location.href);

// 10. Check for errors in console
console.log('10. Check console above for any error messages');
```

---

## Quick Fixes

### Fix 1: Reset Authentication
```javascript
// In browser console:
if (window.supabaseAuth) {
    window.supabaseAuth.signOut().then(() => {
        console.log('Signed out, refresh page');
        window.location.reload();
    });
}
```

### Fix 2: Force Re-initialization
```javascript
// In browser console:
if (window.supabaseAuth) {
    window.supabaseAuth.init().then(() => {
        console.log('Re-initialized, check status');
    });
}
```

### Fix 3: Check Supabase Connection
```javascript
// In browser console:
if (window.supabaseAuth?.supabase) {
    window.supabaseAuth.supabase
        .from('generated_images')
        .select('count')
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Connection error:', error);
            } else {
                console.log('✅ Connection works!');
            }
        });
}
```

---

## What to Share for Help

If you're still having issues, share:

1. **Browser console errors** (screenshot or copy/paste)
2. **Results from diagnostic script** above
3. **What you're trying to do** (sign in, sign out, access data)
4. **What happens** vs **what you expect**

---

## Related Files

- `assets/js/supabase-auth.js` - Main authentication code
- `assets/js/config.js` - Configuration
- `SUPABASE_RLS_TROUBLESHOOTING.md` - Database access issues
- `docs/guides/AUTHENTICATION_TROUBLESHOOTING_GUIDE.md` - Detailed guide

