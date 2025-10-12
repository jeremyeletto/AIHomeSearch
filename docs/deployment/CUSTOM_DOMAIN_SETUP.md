# Custom Domain Setup: homeupgrades.xyz

## 🎯 Overview
This guide will help you configure your custom domain `homeupgrades.xyz` (purchased from Squarespace) to work with your GitHub Pages deployment.

---

## 📋 Prerequisites
- ✅ Domain purchased: `homeupgrades.xyz` (Squarespace)
- ✅ GitHub Pages deployed: `jeremyeletto.github.io/AIHomeSearch`
- ✅ CNAME file created in repository root

---

## 🔧 Step 1: Configure DNS Settings in Squarespace

### A. Login to Squarespace Domain Management
1. Go to https://account.squarespace.com/domains
2. Click on `homeupgrades.xyz`
3. Navigate to **DNS Settings**

### B. Add GitHub Pages DNS Records

**Add these DNS records:**

#### 1. A Records (for apex domain)
Add **FOUR** A records pointing to GitHub Pages IPs:

```
Type: A
Host: @
Value: 185.199.108.153
TTL: 3600 (or lowest available)
```

```
Type: A
Host: @
Value: 185.199.109.153
TTL: 3600
```

```
Type: A
Host: @
Value: 185.199.110.153
TTL: 3600
```

```
Type: A
Host: @
Value: 185.199.111.153
TTL: 3600
```

#### 2. CNAME Record (for www subdomain)
```
Type: CNAME
Host: www
Value: jeremyeletto.github.io
TTL: 3600
```

#### 3. Remove Conflicting Records
- Remove any existing A records for `@` or `www`
- Remove any CNAME records that conflict
- Keep MX, TXT records for email if needed

---

## 🚀 Step 2: Configure GitHub Pages

### A. Add Custom Domain in GitHub
1. Go to: https://github.com/jeremyeletto/AIHomeSearch/settings/pages
2. Under **Custom domain**, enter: `homeupgrades.xyz`
3. Click **Save**
4. Wait for DNS check (may take a few minutes)
5. Once verified, check **Enforce HTTPS** (recommended)

### B. Verify CNAME File
The CNAME file has been added to your repository root with content:
```
homeupgrades.xyz
```

This file tells GitHub Pages which domain to serve.

---

## 🔐 Step 3: Update Supabase OAuth Settings

### A. Add New Redirect URLs
Go to your Supabase project: https://supabase.com/dashboard

Navigate to: **Authentication > URL Configuration**

Add these redirect URLs:
```
https://homeupgrades.xyz
https://homeupgrades.xyz/
https://www.homeupgrades.xyz
https://www.homeupgrades.xyz/
```

### B. Update Site URL
Set **Site URL** to:
```
https://homeupgrades.xyz
```

### C. Add to Redirect Allow List
In **Redirect URLs** section, add:
```
https://homeupgrades.xyz/**
https://www.homeupgrades.xyz/**
```

---

## 🔄 Step 4: Update Backend CORS (Render)

The `server.js` file has been updated to include your new domain in CORS config.

**You need to redeploy the backend on Render:**

1. Go to: https://dashboard.render.com
2. Find service: `ai-home-upgrades-backend`
3. Click **Manual Deploy** > **Deploy latest commit**
4. Wait for deployment to complete (~2-3 minutes)

---

## ⏱️ Step 5: Wait for DNS Propagation

DNS changes can take time to propagate:
- **Minimum**: 15-30 minutes
- **Maximum**: 24-48 hours
- **Average**: 1-4 hours

### Check DNS Propagation:
Use these tools to verify:
- https://dnschecker.org (enter `homeupgrades.xyz`)
- https://www.whatsmydns.net (enter `homeupgrades.xyz`)

Look for:
- A records pointing to GitHub IPs (185.199.108-111.153)
- CNAME for www pointing to jeremyeletto.github.io

---

## ✅ Step 6: Verify Deployment

### A. Test Domain Access
1. Visit: https://homeupgrades.xyz
2. Verify the site loads correctly
3. Test navigation between pages

### B. Test OAuth Login
1. Click **Sign In**
2. Try Google/Apple/Discord login
3. Verify redirect works correctly

### C. Test API Calls
1. Search for homes (e.g., "Merrick, NY")
2. Click "Imagine Upgrades" on a property
3. Try an upgrade (ensure no CORS errors)

### D. Test WWW Redirect
1. Visit: https://www.homeupgrades.xyz
2. Should redirect to: https://homeupgrades.xyz

---

## 🎨 Changes Made to Repository

### 1. CNAME File Created
```
/CNAME
```
Content: `homeupgrades.xyz`

### 2. OAuth Redirect URLs Updated
File: `assets/js/supabase-auth.js`
- Added custom domain detection
- Supports both homeupgrades.xyz and github.io

### 3. Backend CORS Updated
File: `server.js`
- Added homeupgrades.xyz to allowed origins
- Added www.homeupgrades.xyz to allowed origins

---

## 🔧 Troubleshooting

### Issue: "Domain not verified" on GitHub
**Solution:**
- Wait for DNS propagation (can take 24-48 hours)
- Verify DNS records in Squarespace are correct
- Check DNS with `dig homeupgrades.xyz`

### Issue: SSL/HTTPS not working
**Solution:**
- Wait for DNS propagation first
- GitHub auto-generates SSL certificate (can take 24 hours)
- Don't enable "Enforce HTTPS" until certificate is ready

### Issue: OAuth redirect fails
**Solution:**
- Verify Supabase redirect URLs include new domain
- Check browser console for exact redirect URL being used
- Ensure backend CORS includes new domain

### Issue: "This site can't be reached"
**Solution:**
- DNS not propagated yet - wait longer
- Verify A records are correct in Squarespace
- Try `dig homeupgrades.xyz` to check DNS

### Issue: CORS errors on API calls
**Solution:**
- Backend needs redeployment on Render
- Verify server.js includes new domain
- Check Network tab for CORS headers

---

## 📊 Migration Timeline

**Immediate (0-5 minutes):**
- ✅ CNAME file added to repository
- ✅ OAuth redirect code updated
- ✅ Backend CORS updated
- ✅ Code pushed to GitHub

**Short Term (15 minutes - 4 hours):**
- ⏳ DNS propagation begins
- ⏳ GitHub detects custom domain
- ⏳ SSL certificate generation starts

**Medium Term (4-24 hours):**
- ⏳ DNS fully propagated globally
- ⏳ SSL certificate active
- ⏳ Domain fully functional

**Complete (24-48 hours):**
- ✅ All DNS servers updated
- ✅ HTTPS enforced
- ✅ Full functionality verified

---

## 🎯 Final Checklist

Before considering migration complete:

- [ ] DNS A records added in Squarespace
- [ ] DNS CNAME record added in Squarespace
- [ ] GitHub Pages custom domain configured
- [ ] CNAME file in repository
- [ ] Supabase OAuth URLs updated
- [ ] Backend redeployed on Render
- [ ] DNS propagation complete
- [ ] HTTPS/SSL working
- [ ] OAuth login working
- [ ] API calls working (no CORS)
- [ ] All pages load correctly
- [ ] WWW redirect working

---

## 📞 Support Resources

- **GitHub Pages**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Squarespace DNS**: https://support.squarespace.com/hc/en-us/articles/360002101888
- **DNS Checker**: https://dnschecker.org
- **SSL Status**: https://www.ssllabs.com/ssltest/

---

## 🎉 Success!

Once all steps are complete, your site will be live at:
- **Primary**: https://homeupgrades.xyz
- **Alternate**: https://www.homeupgrades.xyz
- **Legacy**: https://jeremyeletto.github.io/AIHomeSearch (still works)

Your professional custom domain is ready to use! 🚀

