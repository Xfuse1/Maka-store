-- Create storage bucket for hero slide images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-slides',
  'hero-slides',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS on storage.objects is already enabled by Supabase
-- Drop existing policies if they exist, then create new ones

-- Allow public read access to hero slide images
DROP POLICY IF EXISTS "Public read access for hero slide images" ON storage.objects;
CREATE POLICY "Public read access for hero slide images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hero-slides');

-- Allow authenticated users to upload hero slide images
DROP POLICY IF EXISTS "Authenticated users can upload hero slide images" ON storage.objects;
CREATE POLICY "Authenticated users can upload hero slide images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-slides');

-- Allow authenticated users to update hero slide images
DROP POLICY IF EXISTS "Authenticated users can update hero slide images" ON storage.objects;
CREATE POLICY "Authenticated users can update hero slide images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-slides')
WITH CHECK (bucket_id = 'hero-slides');

-- Allow authenticated users to delete hero slide images
DROP POLICY IF EXISTS "Authenticated users can delete hero slide images" ON storage.objects;
CREATE POLICY "Authenticated users can delete hero slide images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hero-slides');
