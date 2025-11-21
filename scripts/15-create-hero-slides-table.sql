-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  subtitle_ar TEXT,
  subtitle_en TEXT,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample hero slides
INSERT INTO hero_slides (
  title_ar,
  title_en,
  subtitle_ar,
  subtitle_en,
  image_url,
  link_url,
  display_order,
  is_active
) VALUES
(
  'مرحباً بكِ في مكة',
  'Welcome to Mecca',
  'أزياء نسائية راقية',
  'Elegant Women''s Fashion',
  'https://source.unsplash.com/random/1920x700?fashion,style',
  '/category/abayas',
  1,
  true
),
(
  'عبايات فاخرة',
  'Luxury Abayas',
  'تصاميم حصرية',
  'Exclusive Designs',
  'https://source.unsplash.com/random/1920x700?abaya,fashion',
  '/category/abayas',
  2,
  true
),
(
  'عروض خاصة',
  'Special Offers',
  'خصومات تصل إلى 50%',
  'Discounts up to 50%',
  'https://source.unsplash.com/random/1920x700?sale,shopping',
  '/category/dresses',
  3,
  true
);
