-- Create storage bucket for page content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'page-images',
  'page-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS on storage.objects is already enabled by Supabase
-- Drop existing policies if they exist, then create new ones

-- Allow public read access to page images
DROP POLICY IF EXISTS "Public read access for page images" ON storage.objects;
CREATE POLICY "Public read access for page images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'page-images');

-- Allow authenticated users to upload page images
DROP POLICY IF EXISTS "Authenticated users can upload page images" ON storage.objects;
CREATE POLICY "Authenticated users can upload page images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images');

-- Allow authenticated users to update page images
DROP POLICY IF EXISTS "Authenticated users can update page images" ON storage.objects;
CREATE POLICY "Authenticated users can update page images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'page-images')
WITH CHECK (bucket_id = 'page-images');

-- Allow authenticated users to delete page images
DROP POLICY IF EXISTS "Authenticated users can delete page images" ON storage.objects;
CREATE POLICY "Authenticated users can delete page images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'page-images');
