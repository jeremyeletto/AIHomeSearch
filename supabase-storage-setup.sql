-- ============================================
-- SUPABASE STORAGE SETUP FOR IMAGES
-- ============================================
-- This script sets up Supabase Storage for image uploads
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage bucket for generated images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'generated-images',
    'generated-images',
    true, -- Public bucket so images can be accessed via URL
    52428800, -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Create storage policies for image uploads
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload own images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'generated-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can view their own images (and public can view all)
CREATE POLICY "Users can view own images" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'generated-images' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)
        )
    );

-- Policy: Public can view all images (since bucket is public)
CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'generated-images'
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'generated-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'generated-images';

-- Check if policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- NOTES
-- ============================================
-- Bucket structure: generated-images/{user_id}/{timestamp}_filename.jpg
-- Public URLs: https://{project}.supabase.co/storage/v1/object/public/generated-images/{user_id}/{timestamp}_filename.jpg
-- 
-- Benefits:
-- - Images served from CDN (fast!)
-- - Database only stores URLs (small!)
-- - Automatic optimization by Supabase
-- - No 33% base64 overhead

