-- Add video_url column to products table
-- Supports both YouTube URLs and direct video file URLs from Supabase Storage
-- Recommendation: Store video URLs only; file storage is handled separately in video_files bucket

ALTER TABLE products
ADD COLUMN video_url TEXT;

-- Add index for faster queries on products with videos
CREATE INDEX IF NOT EXISTS idx_products_video_url ON products(video_url) 
WHERE video_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.video_url IS 
'Optional video URL for product demonstration. Can be:
1. YouTube URL (e.g., https://www.youtube.com/watch?v=...)
2. Direct video file URL from Supabase Storage (e.g., https://xxx.supabase.co/storage/v1/object/public/product-videos/...)
3. External video URL (Vimeo, etc.)

Recommended: Use Supabase Storage for self-hosted videos with maximum 500MB per file.';
