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

## Using the Admin UI

### Access the Admin Page

Navigate to `admin-featured.html` in your browser. You must be logged in to access this page.

### Features

1. **View All Images**: See all your generated images with before/after previews
2. **Filter Images**: 
   - By category (Interior/Exterior/Other)
   - By featured status
   - By search term (address or upgrade type)
3. **Feature Images**: Click the "Feature" button on any image to add it to the carousel
4. **Edit Image Details**: 
   - Set category (interior/exterior/other)
   - Set display order (lower numbers appear first)
5. **Statistics**: View counts of total, featured, interior, and exterior images

### How to Feature an Image

1. Go to `admin-featured.html`
2. Find the image you want to feature
3. Click the "Feature" button
4. Optionally, click the edit button (pencil icon) to:
   - Set the category (interior/exterior/other)
   - Set the display order (1 = first, 2 = second, etc.)

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

### Admin page not loading

1. **Check authentication**: You must be logged in
2. **Check RLS policies**: Ensure you have permission to view your own images
3. **Check browser console**: Look for errors

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

