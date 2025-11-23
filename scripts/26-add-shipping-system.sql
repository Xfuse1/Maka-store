-- Create shipping_zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_code TEXT UNIQUE NOT NULL,
  governorate_name_ar TEXT NOT NULL,
  governorate_name_en TEXT NOT NULL,
  shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- Create policies for shipping_zones (assuming public read, admin write)
-- Adjust 'authenticated' to match your admin role logic if needed, 
-- but for now allowing public read is necessary for checkout.
CREATE POLICY "Public read access" ON shipping_zones
  FOR SELECT USING (true);

-- Assuming there is an admin role or check. 
-- For simplicity in this script, allowing all authenticated to insert/update for now, 
-- or we can rely on service role usage in API routes. 
-- But usually better to be restrictive. 
-- If 'admin' role exists:
-- CREATE POLICY "Admin full access" ON shipping_zones
--   FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_shipping_zones_updated_at 
BEFORE UPDATE ON shipping_zones 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for Egyptian Governorates
INSERT INTO shipping_zones (governorate_code, governorate_name_ar, governorate_name_en, shipping_price) VALUES
('CAIRO', 'القاهرة', 'Cairo', 50),
('GIZA', 'الجيزة', 'Giza', 50),
('ALEXANDRIA', 'الإسكندرية', 'Alexandria', 60),
('DAKAHLIA', 'الدقهلية', 'Dakahlia', 65),
('RED_SEA', 'البحر الأحمر', 'Red Sea', 80),
('BEHEIRA', 'البحيرة', 'Beheira', 65),
('FAYOUM', 'الفيوم', 'Fayoum', 70),
('GHARBIYA', 'الغربية', 'Gharbiya', 65),
('ISMAILIA', 'الإسماعيلية', 'Ismailia', 65),
('MENOFIA', 'المنوفية', 'Menofia', 65),
('MINYA', 'المنيا', 'Minya', 75),
('QALIUBIYA', 'القليوبية', 'Qaliubiya', 55),
('NEW_VALLEY', 'الوادي الجديد', 'New Valley', 90),
('SUEZ', 'السويس', 'Suez', 65),
('ASWAN', 'أسوان', 'Aswan', 85),
('ASSIUT', 'أسيوط', 'Assiut', 75),
('BENI_SUEF', 'بني سويف', 'Beni Suef', 70),
('PORT_SAID', 'بورسعيد', 'Port Said', 65),
('DAMIETTA', 'دمياط', 'Damietta', 65),
('SHARKIA', 'الشرقية', 'Sharkia', 65),
('SOUTH_SINAI', 'جنوب سيناء', 'South Sinai', 90),
('KAFR_EL_SHEIKH', 'كفر الشيخ', 'Kafr El Sheikh', 65),
('MATROUH', 'مطروح', 'Matrouh', 80),
('LUXOR', 'الأقصر', 'Luxor', 85),
('QENA', 'قنا', 'Qena', 80),
('NORTH_SINAI', 'شمال سيناء', 'North Sinai', 90),
('SOHAG', 'سوهاج', 'Sohag', 75)
ON CONFLICT (governorate_code) DO NOTHING;

-- Add free_shipping column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false;

-- Migrate existing data if shipping_type column exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'shipping_type') THEN
    UPDATE products SET free_shipping = true WHERE shipping_type = 'free';
  END IF;
END $$;
