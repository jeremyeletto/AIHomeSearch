-- ============================================
-- VERIFY STORAGE SETUP
-- ============================================
-- Run this to verify storage bucket and policies are set up correctly
-- ============================================

-- 1. Check if bucket exists
SELECT 
    id,
    name,
    public as "Is Public",
    file_size_limit as "File Size Limit (bytes)",
    allowed_mime_types as "Allowed Types",
    CASE 
        WHEN id = 'generated-images' THEN '✅ Bucket exists'
        ELSE '❌ Bucket not found'
    END as status
FROM storage.buckets
WHERE id = 'generated-images';

-- 2. Check storage policies
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ View access'
        WHEN cmd = 'INSERT' THEN '✅ Upload access'
        WHEN cmd = 'DELETE' THEN '✅ Delete access'
        ELSE cmd
    END as "What it does"
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%image%'
ORDER BY cmd;

-- 3. Count total policies for storage.objects
SELECT 
    COUNT(*) as "Total Storage Policies",
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ Policies configured'
        ELSE '⚠️ Missing policies'
    END as status
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running, you should see:
-- 
-- 1. Bucket: generated-images exists and is public ✅
-- 2. At least 3 policies (SELECT, INSERT, DELETE) ✅
-- 3. Total Storage Policies: 3 or more ✅
-- 
-- If all checks pass, storage is ready! 🎉

