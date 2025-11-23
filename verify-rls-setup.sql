-- ============================================
-- VERIFY RLS SETUP FOR generated_images
-- ============================================
-- Run this after running supabase-rls-fix.sql
-- This will show you if everything is set up correctly
-- ============================================

-- 1. Check if RLS is enabled on the table
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ RLS is ENABLED'
        ELSE '❌ RLS is DISABLED - Run the fix script!'
    END as status
FROM pg_tables 
WHERE tablename = 'generated_images';

-- 2. Check if all policies exist
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ Users can view their images'
        WHEN cmd = 'INSERT' THEN '✅ Users can create images'
        WHEN cmd = 'UPDATE' THEN '✅ Users can update their images'
        WHEN cmd = 'DELETE' THEN '✅ Users can delete their images'
        ELSE cmd
    END as "What it does"
FROM pg_policies 
WHERE tablename = 'generated_images'
ORDER BY cmd;

-- 3. Count how many policies exist (should be 4)
SELECT 
    COUNT(*) as "Total Policies",
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ All 4 policies exist'
        WHEN COUNT(*) = 0 THEN '❌ No policies found - Run the fix script!'
        ELSE '⚠️ Only ' || COUNT(*) || ' policies found (expected 4)'
    END as status
FROM pg_policies 
WHERE tablename = 'generated_images';

-- 4. Check table structure (verify user_id column exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'user_id' AND is_nullable = 'NO' THEN '✅ Correct'
        WHEN column_name = 'user_id' AND is_nullable = 'YES' THEN '⚠️ Should be NOT NULL'
        ELSE ''
    END as status
FROM information_schema.columns
WHERE table_name = 'generated_images'
ORDER BY ordinal_position;

-- 5. Check indexes (for performance)
SELECT 
    indexname as "Index Name",
    CASE 
        WHEN indexname LIKE '%user_id%' THEN '✅ User ID index exists'
        WHEN indexname LIKE '%created_at%' THEN '✅ Created at index exists'
        ELSE indexname
    END as status
FROM pg_indexes
WHERE tablename = 'generated_images';

-- 6. Test auth.uid() function (should return your user ID if authenticated)
SELECT 
    auth.uid() as "Your User ID",
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ You are authenticated'
        ELSE '⚠️ Not authenticated - Sign in to test queries'
    END as status;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this, you should see:
-- 
-- 1. RLS Enabled: true ✅
-- 2. 4 policies (SELECT, INSERT, UPDATE, DELETE) ✅
-- 3. Total Policies: 4 ✅
-- 4. user_id column exists and is NOT NULL ✅
-- 5. At least 2 indexes (user_id and created_at) ✅
-- 6. Your User ID: [your UUID] ✅
-- 
-- If all checks pass, your app should work! 🎉

