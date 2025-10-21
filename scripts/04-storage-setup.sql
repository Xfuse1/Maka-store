-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('pages', 'pages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public read access
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Public can view category images" ON storage.objects
  FOR SELECT USING (bucket_id = 'categories');

CREATE POLICY "Public can view page images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pages');

-- Note: Upload policies would require authentication
-- These should be added when you set up admin authentication
