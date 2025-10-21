-- Create homepage_sections table for managing homepage content
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL, -- 'hero', 'featured_categories', 'featured_products', 'promotional'
  title_ar TEXT,
  title_en TEXT,
  subtitle_ar TEXT,
  subtitle_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  button_text_ar TEXT,
  button_text_en TEXT,
  button_link TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- For additional flexible settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active, display_order);

-- Insert default hero section
INSERT INTO homepage_sections (section_type, title_ar, title_en, subtitle_ar, subtitle_en, description_ar, description_en, button_text_ar, button_text_en, button_link, image_url, display_order, is_active)
VALUES 
('hero', 'وصل حديثاً', 'New Arrivals', 'أحدث صيحات الموضة', 'Latest Fashion Trends', 'منتجات جديدة تضاف أسبوعياً', 'New products added weekly', 'تسوق الجديد', 'Shop New', '#new-products', '/new-fashion-arrivals-modern-women-clothing.jpg', 1, true),
('hero', 'أناقة لا تُضاهى', 'Unmatched Elegance', 'اكتشفي مجموعتنا الحصرية', 'Discover Our Exclusive Collection', 'تصاميم عصرية تجمع بين الأصالة والحداثة', 'Modern designs combining authenticity and modernity', 'تسوقي الآن', 'Shop Now', '#categories', '/elegant-fashion-banner-women-modest-clothing.jpg', 2, true),
('hero', 'عبايات فاخرة', 'Luxury Abayas', 'تشكيلة واسعة من العبايات الأنيقة', 'Wide Selection of Elegant Abayas', 'عبايات مطرزة وكلاسيكية لجميع المناسبات', 'Embroidered and classic abayas for all occasions', 'اكتشفي المزيد', 'Discover More', '/category/abayas', '/luxury-abayas-collection-elegant-black-modest-fash.jpg', 3, true);
