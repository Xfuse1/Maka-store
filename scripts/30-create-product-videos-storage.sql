-- Create product-videos storage bucket for self-hosted product videos
-- Recommendation: This bucket stores product demonstration videos
-- Maximum file size is configured at 500MB per file (adjust in video-upload.ts if needed)

-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by Supabase by default
-- No need to run ALTER TABLE - proceed directly to policies

-- Policy 1: Allow anyone to view (GET) public product videos
-- Recommendation: Videos are public, so customers can watch without authentication
CREATE POLICY "Allow public read access to product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

-- Policy 2: Allow authenticated users to upload videos to their product folders
-- Recommendation: Only admins can upload; controlled via application logic
CREATE POLICY "Allow authenticated users to upload product videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-videos' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to delete their own product videos
-- Recommendation: Allow deletion of videos for product updates
CREATE POLICY "Allow authenticated users to delete product videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-videos'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow updating metadata for product videos
CREATE POLICY "Allow authenticated users to update product video metadata"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-videos'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-videos'
  AND auth.role() = 'authenticated'
);
