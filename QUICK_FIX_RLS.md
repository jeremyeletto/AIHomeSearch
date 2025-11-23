# 🚀 Quick Fix: Supabase 500 Error

## The Problem
You're getting a `500` error when loading images. This is caused by missing or misconfigured Row Level Security (RLS) policies.

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Open the file `supabase-rls-fix.sql` in this project
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify It Worked

**Option A: Quick Test (Recommended)**
1. Refresh your app
2. Navigate to "My Images" page
3. Images should load without errors ✅

**Option B: Detailed Verification**
1. Run the verification script: `verify-rls-setup.sql`
2. Check the results - you should see:
   - ✅ RLS is ENABLED
   - ✅ 4 policies exist (SELECT, INSERT, UPDATE, DELETE)
   - ✅ user_id column exists
   - ✅ Indexes created

**Note**: "No rows returned" is NORMAL for DDL statements - it means the script ran successfully!

## What the Script Does

- ✅ Enables Row Level Security on `generated_images` table
- ✅ Creates 4 security policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ Creates performance indexes
- ✅ Verifies everything is set up correctly

## Still Getting Errors?

See the detailed guide: `SUPABASE_RLS_TROUBLESHOOTING.md`

## Files Created

- `supabase-rls-fix.sql` - The fix script (run this!)
- `SUPABASE_RLS_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- Updated `supabase-auth.js` - Better error messages for RLS issues

