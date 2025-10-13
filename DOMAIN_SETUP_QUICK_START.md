# 🚀 Quick Start: homeupgrades.xyz Setup

## ✅ What's Done (Already Pushed to GitHub)
- [x] CNAME file created
- [x] OAuth redirects updated
- [x] Backend CORS configured
- [x] Code deployed to GitHub

---

## 📋 YOUR ACTION ITEMS (Do These Now)

### 1️⃣ Configure DNS in Squarespace (5 minutes)

**Go to:** https://account.squarespace.com/domains
**Select:** homeupgrades.xyz → DNS Settings

**Add these records:**

#### A Records (Add all 4):
```
Type: A, Host: @, Value: 185.199.108.153
Type: A, Host: @, Value: 185.199.109.153
Type: A, Host: @, Value: 185.199.110.153
Type: A, Host: @, Value: 185.199.111.153
```

#### CNAME Record:
```
Type: CNAME, Host: www, Value: jeremyeletto.github.io
```

---

### 2️⃣ Configure GitHub Pages (2 minutes)

**Go to:** https://github.com/jeremyeletto/AIHomeSearch/settings/pages

1. Under "Custom domain" enter: `homeupgrades.xyz`
2. Click **Save**
3. Wait for DNS check (green checkmark)
4. Enable **Enforce HTTPS** (after DNS propagates)

---

### 3️⃣ Update Supabase OAuth (3 minutes)

**Go to:** https://supabase.com/dashboard → Your Project → Authentication → URL Configuration

**Add these Redirect URLs:**
```
https://homeupgrades.xyz
https://homeupgrades.xyz/
https://www.homeupgrades.xyz
https://www.homeupgrades.xyz/
```

**Set Site URL to:**
```
https://homeupgrades.xyz
```

**Add to Redirect Allow List:**
```
https://homeupgrades.xyz/**
https://www.homeupgrades.xyz/**
```

---

### 4️⃣ Redeploy Backend on Render (2 minutes)

**Go to:** https://dashboard.render.com

1. Find: `ai-home-upgrades-backend`
2. Click: **Manual Deploy** → **Deploy latest commit**
3. Wait ~2-3 minutes for deployment

*(This enables CORS for your new domain)*

---

## ⏱️ Wait for DNS Propagation

**Typical Wait Times:**
- Minimum: 15-30 minutes
- Average: 1-4 hours  
- Maximum: 24-48 hours

**Check Progress:**
- https://dnschecker.org (enter homeupgrades.xyz)
- https://www.whatsmydns.net

---

## ✅ Verification Checklist

Once DNS propagates, test:

- [ ] Visit https://homeupgrades.xyz (site loads)
- [ ] Visit https://www.homeupgrades.xyz (redirects)
- [ ] HTTPS/SSL working (green lock icon)
- [ ] Sign in with Google (OAuth works)
- [ ] Search for homes (API works, no CORS)
- [ ] Imagine Upgrades button works

---

## 📞 Need Help?

**Full Documentation:** `/docs/deployment/CUSTOM_DOMAIN_SETUP.md`

**Common Issues:**
- DNS not propagated → Wait longer (up to 48 hours)
- HTTPS error → Wait for GitHub SSL cert (up to 24 hours)
- OAuth fails → Check Supabase redirect URLs
- CORS error → Redeploy backend on Render

---

## 🎉 Timeline

**Now → 5 min:** Complete steps 1-4 above  
**15 min → 4 hrs:** DNS propagation  
**4 hrs → 24 hrs:** SSL certificate generation  
**24-48 hrs:** Fully operational worldwide

Your site will be live at **homeupgrades.xyz** soon! 🚀

