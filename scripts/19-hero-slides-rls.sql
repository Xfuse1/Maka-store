-- Enable RLS on hero_slides table
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active hero slides
CREATE POLICY "Allow public read access to active hero slides"
ON hero_slides
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow authenticated users full access to hero slides"
ON hero_slides
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
