# Featured Images Carousel Guide

This guide explains how to set up and use the featured images carousel on your home page.

## Setup

### 1. Run Database Migration

First, run the SQL migration to add the necessary columns to your `generated_images` table:

```sql
-- Run this in Supabase SQL Editor
-- File: featured-images-setup.sql
```

This will add:
- `is_featured` (BOOLEAN) - Marks images as featured
- `image_category` (TEXT) - Categories: 'interior', 'exterior', or 'other'
- `display_order` (INTEGER) - Controls the order in which images appear

### 2. Update RLS Policies

The migration also creates a public policy that allows anyone to view featured images (even without authentication), which is necessary for the home page carousel.

## Managing Featured Images

### Using Supabase UI

Featured images are managed directly in the Supabase dashboard:

1. **Go to Supabase Dashboard**: Navigate to your project's Table Editor
2. **Open `generated_images` table**: Find the image you want to feature
3. **Set `is_featured` to `true`**: Toggle the boolean field
4. **Optional Settings**:
   - Set `image_category` to 'interior', 'exterior', or 'other'
   - Set `display_order` (lower numbers appear first)

### How to Feature an Image

1. Open Supabase Dashboard → Table Editor → `generated_images`
2. Find the image row you want to feature
3. Click to edit the row
4. Set `is_featured` = `true`
5. Optionally set:
   - `image_category` = 'interior' or 'exterior' or 'other'
   - `display_order` = 1, 2, 3, etc. (lower numbers appear first)
6. Save the changes

### Display Order

Images are sorted by:
1. `display_order` (ascending) - Lower numbers first
2. `created_at` (descending) - Newer images first if display_order is the same

## Home Page Carousel

The carousel automatically appears on `index.html` and displays all featured images.

### Features

- **Auto-play**: Automatically cycles through images every 5 seconds
- **Manual Navigation**: Use arrow buttons or indicators to navigate
- **Responsive**: Works on desktop, tablet, and mobile
- **Before/After Split View**: Shows both original and upgraded images side-by-side
- **Category Badges**: Displays whether the image is interior or exterior
- **Upgrade Type**: Shows the type of upgrade applied

### Customization

You can customize the carousel by editing:
- `assets/css/featured-carousel.css` - Styling
- `assets/js/featured-carousel.js` - Behavior and data fetching

## Database Schema

```sql
-- Featured images columns
is_featured BOOLEAN DEFAULT FALSE
image_category TEXT CHECK (image_category IN ('interior', 'exterior', 'other'))
display_order INTEGER DEFAULT 0
```

## Example Queries

### Feature an image
```sql
UPDATE generated_images 
SET is_featured = TRUE, 
    image_category = 'exterior',
    display_order = 1
WHERE id = 'your-image-id';
```

### Unfeature an image
```sql
UPDATE generated_images 
SET is_featured = FALSE
WHERE id = 'your-image-id';
```

### Get all featured images
```sql
SELECT * FROM generated_images 
WHERE is_featured = TRUE 
ORDER BY display_order, created_at DESC;
```

## Troubleshooting

### Carousel not showing images

1. **Check if images are featured**: Make sure `is_featured = TRUE` in the database
2. **Check RLS policies**: Ensure the "Public can view featured images" policy exists
3. **Check browser console**: Look for JavaScript errors
4. **Verify Supabase connection**: Check that Supabase client is initialized

### Can't update featured status in Supabase

1. **Check permissions**: Ensure you have edit access to the table
2. **Check RLS policies**: Ensure you have permission to update your own images
3. **Verify connection**: Check that you're connected to the correct Supabase project

### Images not updating

1. **Refresh the page**: The carousel caches data
2. **Check display_order**: Make sure featured images have proper ordering
3. **Verify database**: Check that `is_featured` is actually set to `TRUE`

## Notes

- Featured images are publicly viewable (no authentication required) on the home page
- The carousel loads up to 20 featured images
- Images are sorted by display_order first, then by creation date
- The carousel uses Bootstrap 5 carousel component
- All images are lazy-loaded for better performance

