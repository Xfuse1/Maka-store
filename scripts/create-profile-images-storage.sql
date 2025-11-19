-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- Allow anyone to view profile images (public read)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile image
CREATE POLICY "Authenticated users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
