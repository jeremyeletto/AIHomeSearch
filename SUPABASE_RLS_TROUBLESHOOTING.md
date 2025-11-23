# 🔧 Supabase RLS Troubleshooting Guide

## Problem: 500 Error When Loading Images

You're getting a `500` error when trying to fetch images from the `generated_images` table. This is almost always caused by **Row Level Security (RLS) policy issues**.

## Quick Fix

1. **Open Supabase SQL Editor**: Go to your Supabase project → SQL Editor
2. **Run the fix script**: Copy and paste the contents of `supabase-rls-fix.sql` into the SQL Editor
3. **Execute the script**: Click "Run" to apply all fixes
4. **Refresh your app**: Try loading images again

## What Causes This Error?

A 500 error from Supabase typically means:

1. **RLS is enabled but no policies exist** → All queries are blocked
2. **RLS policies are misconfigured** → Policies don't match your query
3. **RLS is not enabled but should be** → Security issue
4. **Table structure mismatch** → Column names/types don't match

## Step-by-Step Diagnosis

### Step 1: Check if RLS is Enabled

Run this in Supabase SQL Editor:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'generated_images';
```

**Expected result**: `rowsecurity = true`

**If false**: RLS is not enabled. Run:
```sql
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
```

### Step 2: Check if Policies Exist

Run this query:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'generated_images';
```

**Expected result**: You should see 4 policies:
- `Users can view own images` (SELECT)
- `Users can insert own images` (INSERT)
- `Users can update own images` (UPDATE)
- `Users can delete own images` (DELETE)

**If no policies**: Run the `supabase-rls-fix.sql` script.

### Step 3: Verify Table Structure

Check that your table has the correct columns:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'generated_images'
ORDER BY ordinal_position;
```

**Required columns**:
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, NOT NULL) ← **Critical for RLS**
- `original_image_url` (TEXT)
- `generated_image_url` (TEXT)
- `prompt` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### Step 4: Test Authentication

Verify that `auth.uid()` works:

```sql
SELECT auth.uid();
```

**Expected result**: Should return your user UUID when authenticated, or `NULL` if not authenticated.

**If NULL**: Your authentication session may have expired. Sign out and sign back in.

### Step 5: Test Query with Your User ID

Replace `YOUR_USER_ID` with your actual user ID:

```sql
SELECT COUNT(*) 
FROM generated_images 
WHERE user_id = 'YOUR_USER_ID';
```

**Expected result**: Should return the count of your images without errors.

**If error**: The RLS policy is not working correctly. Check the policy definition.

## Common Issues and Solutions

### Issue 1: "permission denied for table generated_images"

**Cause**: RLS is enabled but no SELECT policy exists.

**Solution**: Create the SELECT policy:
```sql
CREATE POLICY "Users can view own images" ON generated_images
  FOR SELECT 
  USING (auth.uid() = user_id);
```

### Issue 2: "new row violates row-level security policy"

**Cause**: INSERT policy is missing or incorrect.

**Solution**: Create the INSERT policy:
```sql
CREATE POLICY "Users can insert own images" ON generated_images
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### Issue 3: Query works in SQL Editor but fails in app

**Cause**: The app is using a different authentication context.

**Solution**: 
1. Check that the Supabase client is initialized with the correct anon key
2. Verify the user is authenticated: `window.supabaseAuth.isAuthenticated()`
3. Check browser console for authentication errors

### Issue 4: "relation does not exist"

**Cause**: Table name is wrong or table doesn't exist.

**Solution**: 
1. Check table name in Supabase dashboard
2. Verify the table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'generated_images';`
3. If missing, create the table using the schema from `production-supabase-schema.sql`

### Issue 5: Policies exist but queries still fail

**Cause**: Policy definition is incorrect or conflicting policies exist.

**Solution**:
1. Drop all existing policies:
```sql
DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert own images" ON generated_images;
DROP POLICY IF EXISTS "Users can update own images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete own images" ON generated_images;
```

2. Recreate them using the `supabase-rls-fix.sql` script

## Verification Checklist

After running the fix script, verify:

- [ ] RLS is enabled on `generated_images` table
- [ ] 4 policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] `user_id` column exists and is NOT NULL
- [ ] `auth.uid()` returns your user ID when authenticated
- [ ] Test query works in SQL Editor
- [ ] App can load images without 500 errors

## Testing in Your App

1. **Open browser console** (F12)
2. **Navigate to My Images page**
3. **Check for errors**:
   - ❌ `500` error = RLS issue (run fix script)
   - ❌ `401` error = Authentication issue (sign in again)
   - ❌ `404` error = Table doesn't exist (create table)
   - ✅ No errors = Success!

## Getting Help

If you've tried all the above and still get errors:

1. **Check Supabase logs**: Dashboard → Logs → API Logs
2. **Check browser console**: Look for detailed error messages
3. **Verify Supabase project settings**: Ensure you're using the correct project
4. **Test with a simple query**: Try `SELECT * FROM generated_images LIMIT 1;` in SQL Editor

## Prevention

To avoid this issue in the future:

1. **Always enable RLS** when creating tables
2. **Create policies immediately** after creating tables
3. **Test queries** in SQL Editor before using in app
4. **Keep schema files updated** in your repository

## Related Files

- `supabase-rls-fix.sql` - Complete fix script
- `docs/deployment/production-supabase-schema.sql` - Full database schema
- `assets/js/supabase-auth.js` - Authentication and query code

