-- ============================================
-- SUPABASE RLS FIX FOR generated_images TABLE
-- ============================================
-- This script fixes the 500 error when querying generated_images
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
-- ============================================

-- Step 1: Enable Row Level Security on generated_images table
-- This is CRITICAL - RLS must be enabled before policies work
ALTER TABLE IF EXISTS generated_images ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert own images" ON generated_images;
DROP POLICY IF EXISTS "Users can update own images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete own images" ON generated_images;

-- Step 3: Create RLS policies for generated_images
-- These policies ensure users can only access their own data

-- SELECT policy: Users can view their own images
CREATE POLICY "Users can view own images" ON generated_images
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT policy: Users can insert images with their own user_id
CREATE POLICY "Users can insert own images" ON generated_images
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update their own images
CREATE POLICY "Users can update own images" ON generated_images
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete their own images
CREATE POLICY "Users can delete own images" ON generated_images
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Step 4: Verify the table structure matches your schema
-- Check that user_id column exists and is the correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generated_images' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'user_id column does not exist in generated_images table';
  END IF;
END $$;

-- Step 5: Create index for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id 
  ON generated_images(user_id);
  
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at 
  ON generated_images(created_at DESC);

-- Step 6: Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'generated_images' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS may not be enabled on generated_images table';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after the script to verify everything is set up correctly:

-- 1. Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'generated_images';

-- 2. Check if policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'generated_images';

-- 3. Test query (should work if authenticated)
-- SELECT COUNT(*) FROM generated_images;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If you still get 500 errors after running this script:

-- 1. Check that user_id column is NOT NULL
-- ALTER TABLE generated_images ALTER COLUMN user_id SET NOT NULL;

-- 2. Check that user_id references auth.users
-- ALTER TABLE generated_images 
-- ADD CONSTRAINT fk_user_id 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Verify auth.uid() function works
-- SELECT auth.uid();

-- 4. Check for conflicting policies
-- SELECT * FROM pg_policies WHERE tablename = 'generated_images';

-- 5. If policies exist but queries fail, try recreating them:
-- DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
-- CREATE POLICY "Users can view own images" ON generated_images
--   FOR SELECT USING (auth.uid() = user_id);

