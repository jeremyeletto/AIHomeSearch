-- ============================================
-- EXAMPLES: How to Feature Images
-- ============================================
-- Run these in Supabase SQL Editor
-- ============================================

-- Method 1: Feature a specific image by ID
UPDATE generated_images 
SET is_featured = TRUE, 
    image_category = 'exterior',  -- or 'interior' or 'other'
    display_order = 1
WHERE id = 'your-image-id-here';

-- Method 2: Feature multiple images at once
UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'exterior',
    display_order = 1
WHERE id IN (
    'image-id-1',
    'image-id-2',
    'image-id-3'
);

-- Method 3: Feature the most recent images
UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'exterior',
    display_order = 1
WHERE id IN (
    SELECT id 
    FROM generated_images 
    ORDER BY created_at DESC 
    LIMIT 5
);

-- Method 4: Feature images by upgrade type
UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'exterior',
    display_order = 1
WHERE upgrade_type = 'Modern Exterior Upgrade'
AND is_featured = FALSE;

-- Method 5: Feature images with specific display order
-- (Lower numbers appear first in the carousel)
UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'exterior',
    display_order = 1  -- First image
WHERE id = 'image-id-1';

UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'interior',
    display_order = 2  -- Second image
WHERE id = 'image-id-2';

UPDATE generated_images 
SET is_featured = TRUE,
    image_category = 'exterior',
    display_order = 3  -- Third image
WHERE id = 'image-id-3';

-- ============================================
-- QUERIES TO FIND IMAGES
-- ============================================

-- See all your images with their IDs
SELECT 
    id,
    upgrade_type,
    property_address,
    created_at,
    is_featured,
    image_category
FROM generated_images 
ORDER BY created_at DESC
LIMIT 20;

-- See only non-featured images
SELECT 
    id,
    upgrade_type,
    property_address,
    created_at
FROM generated_images 
WHERE is_featured = FALSE
ORDER BY created_at DESC
LIMIT 20;

-- See currently featured images
SELECT 
    id,
    upgrade_type,
    image_category,
    display_order,
    property_address,
    created_at
FROM generated_images 
WHERE is_featured = TRUE 
ORDER BY display_order, created_at DESC;

-- ============================================
-- UNFEATURE IMAGES
-- ============================================

-- Unfeature a specific image
UPDATE generated_images 
SET is_featured = FALSE
WHERE id = 'your-image-id-here';

-- Unfeature all images
UPDATE generated_images 
SET is_featured = FALSE;

-- ============================================
-- UPDATE CATEGORY OR ORDER
-- ============================================

-- Change category of a featured image
UPDATE generated_images 
SET image_category = 'interior'  -- or 'exterior' or 'other'
WHERE id = 'your-image-id-here';

-- Change display order
UPDATE generated_images 
SET display_order = 1  -- Lower = appears first
WHERE id = 'your-image-id-here';

