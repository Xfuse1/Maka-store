-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'categories',
  'categories',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage category images" ON storage.objects;

-- Policy: Anyone can view category images (public read)
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

-- Policy: Service role can upload/update/delete (via API routes)
CREATE POLICY "Service role can manage category images"
ON storage.objects FOR ALL
USING (bucket_id = 'categories')
WITH CHECK (bucket_id = 'categories');
