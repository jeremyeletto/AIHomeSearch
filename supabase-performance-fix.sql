-- ============================================
-- SUPABASE PERFORMANCE FIX FOR generated_images
-- ============================================
-- This script fixes timeout errors by creating optimized indexes
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create composite index for the most common query pattern
-- This index optimizes: WHERE user_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_generated_images_user_created 
  ON generated_images(user_id, created_at DESC);

-- Step 2: Ensure single-column indexes exist (for other query patterns)
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id 
  ON generated_images(user_id);
  
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at 
  ON generated_images(created_at DESC);

-- Step 3: Analyze the table to update statistics (helps query planner)
ANALYZE generated_images;

-- Step 4: Check index usage (run this to verify indexes exist)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'generated_images'
ORDER BY indexname;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, you should see at least 3 indexes:
-- 1. idx_generated_images_user_created (composite - most important!)
-- 2. idx_generated_images_user_id
-- 3. idx_generated_images_created_at
-- 
-- The composite index will make queries MUCH faster!

