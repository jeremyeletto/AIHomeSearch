-- ============================================
-- FEATURED IMAGES SETUP
-- ============================================
-- This script adds support for featuring before/after images
-- on the home page carousel
-- ============================================

-- Step 1: Add is_featured column to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Step 2: Add category column to distinguish interior vs exterior
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS image_category TEXT CHECK (image_category IN ('interior', 'exterior', 'other'));

-- Step 3: Add display_order column for custom ordering in carousel
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Step 4: Create index for featured images queries
CREATE INDEX IF NOT EXISTS idx_generated_images_featured 
ON generated_images(is_featured, display_order, created_at DESC) 
WHERE is_featured = TRUE;

-- Step 5: Update RLS policy to allow public viewing of featured images
-- First, drop existing view policy if it exists
DROP POLICY IF EXISTS "Public can view featured images" ON generated_images;

-- Create policy for public to view featured images
CREATE POLICY "Public can view featured images" ON generated_images
    FOR SELECT
    USING (is_featured = TRUE);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if columns exist:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'generated_images' 
-- AND column_name IN ('is_featured', 'image_category', 'display_order');

-- Check featured images:
-- SELECT id, upgrade_type, image_category, is_featured, display_order, created_at
-- FROM generated_images 
-- WHERE is_featured = TRUE 
-- ORDER BY display_order, created_at DESC;

-- ============================================
-- NOTES
-- ============================================
-- To feature an image:
-- UPDATE generated_images 
-- SET is_featured = TRUE, 
--     image_category = 'exterior', -- or 'interior'
--     display_order = 1
-- WHERE id = 'your-image-id';

-- To unfeature an image:
-- UPDATE generated_images 
-- SET is_featured = FALSE
-- WHERE id = 'your-image-id';

