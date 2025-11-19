-- Create storage bucket for site logo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-logo',
  'site-logo',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view site logo" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage site logo" ON storage.objects;

-- Policy: Anyone can view the logo (public read)
CREATE POLICY "Anyone can view site logo"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-logo');

-- Policy: Only service role can upload/update/delete (via API routes)
-- Note: This policy allows authenticated users, but the API route will use service role key
CREATE POLICY "Service role can manage site logo"
ON storage.objects FOR ALL
USING (bucket_id = 'site-logo')
WITH CHECK (bucket_id = 'site-logo');

-- Ensure design_settings table exists and has proper RLS
-- The table should already exist from 01-create-tables.sql
-- We just need to ensure the initial logo entry exists

-- Insert or update the default logo entry
INSERT INTO design_settings (key, value, description)
VALUES (
  'site_logo',
  '{"url": "/placeholder-logo.svg", "updated_at": null}'::jsonb,
  'Site logo URL and metadata'
)
ON CONFLICT (key) DO UPDATE 
SET description = EXCLUDED.description
WHERE design_settings.key = 'site_logo';

-- Note: RLS policies for design_settings are managed in 02-enable-rls.sql
-- Public can read, but only service role (via API) can write
