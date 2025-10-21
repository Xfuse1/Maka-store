-- Add columns for hero slides to homepage_sections table
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS title_ar VARCHAR(200),
ADD COLUMN IF NOT EXISTS title_en VARCHAR(200),
ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS button_text_ar VARCHAR(100),
ADD COLUMN IF NOT EXISTS button_text_en VARCHAR(100),
ADD COLUMN IF NOT EXISTS button_link VARCHAR(500);

-- Insert sample hero slides
INSERT INTO homepage_sections (
  section_type,
  name_ar,
  title_ar,
  subtitle_ar,
  description_ar,
  button_text_ar,
  button_link,
  image_url,
  display_order,
  is_active,
  show_title,
  show_description
) VALUES
(
  'hero',
  'سلايد ترحيبي',
  'مرحباً بكِ في مكة',
  'أزياء نسائية راقية',
  'اكتشفي أحدث التصاميم العصرية التي تجمع بين الأصالة والحداثة',
  'تسوقي الآن',
  '/category/abayas',
  '/placeholder.svg?height=700&width=1920',
  1,
  true,
  true,
  true
),
(
  'hero',
  'سلايد العبايات',
  'عبايات فاخرة',
  'تصاميم حصرية',
  'مجموعة متنوعة من العبايات الأنيقة لكل المناسبات',
  'اكتشفي المزيد',
  '/category/abayas',
  '/placeholder.svg?height=700&width=1920',
  2,
  true,
  true,
  true
),
(
  'hero',
  'سلايد التخفيضات',
  'عروض خاصة',
  'خصومات تصل إلى 50%',
  'لا تفوتي فرصة الحصول على أفضل الأسعار',
  'تسوقي العروض',
  '/category/dresses',
  '/placeholder.svg?height=700&width=1920',
  3,
  true,
  true,
  true
);
