-- ============================================
-- VERIFY FEATURED IMAGES SETUP
-- ============================================
-- Run this to verify the migration was successful
-- ============================================

-- 1. Check if columns exist
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_images' 
AND column_name IN ('is_featured', 'image_category', 'display_order')
ORDER BY column_name;

-- 2. Check if index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'generated_images' 
AND indexname = 'idx_generated_images_featured';

-- 3. Check if RLS policy exists
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'generated_images' 
AND policyname = 'Public can view featured images';

-- 4. Check current featured images count
SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE is_featured = TRUE) as featured_count,
    COUNT(*) FILTER (WHERE image_category = 'interior') as interior_count,
    COUNT(*) FILTER (WHERE image_category = 'exterior') as exterior_count
FROM generated_images;

-- 5. Show sample of featured images (if any)
SELECT 
    id,
    upgrade_type,
    image_category,
    is_featured,
    display_order,
    created_at
FROM generated_images 
WHERE is_featured = TRUE 
ORDER BY display_order, created_at DESC
LIMIT 10;
