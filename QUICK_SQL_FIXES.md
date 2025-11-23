# 🚀 Quick SQL Fixes for Supabase

## Which Script to Run?

You have **TWO** SQL scripts to run. Run them in this order:

### 1. First: RLS Fix (if you haven't already)
**File**: `supabase-rls-fix.sql`
- Fixes 500 errors
- Sets up Row Level Security policies
- Run this FIRST if you're getting permission errors

### 2. Second: Performance Fix (for timeout errors)
**File**: `supabase-performance-fix.sql`
- Fixes timeout errors (code 57014)
- Creates optimized indexes
- Run this if queries are timing out

## How to Run

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Click "SQL Editor"** in the left sidebar
4. **Open the SQL file** (NOT the .md file!)
5. **Copy ONLY the SQL code** (the parts between the comments)
6. **Paste into SQL Editor**
7. **Click "Run"**

## ⚠️ Important

- **DO NOT** copy markdown files (.md) - they're documentation, not SQL!
- **DO** copy SQL files (.sql) - these are the actual scripts
- Make sure you're copying the `.sql` file, not the `.md` file

## Files You Need

✅ **supabase-rls-fix.sql** - For RLS/policy errors  
✅ **supabase-performance-fix.sql** - For timeout errors  
❌ **SUPABASE_RLS_TROUBLESHOOTING.md** - Documentation only (don't run this!)

## Quick Copy-Paste

If you just want the SQL without comments, here's the performance fix:

```sql
CREATE INDEX IF NOT EXISTS idx_generated_images_user_created 
  ON generated_images(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_id 
  ON generated_images(user_id);
  
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at 
  ON generated_images(created_at DESC);

ANALYZE generated_images;
```

