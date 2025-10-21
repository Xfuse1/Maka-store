-- Insert categories
INSERT INTO categories (name_ar, name_en, slug, description_ar, description_en, display_order) VALUES
  ('عبايات', 'Abayas', 'abayas', 'مجموعة متنوعة من العبايات الأنيقة', 'Elegant collection of abayas', 1),
  ('فساتين', 'Dresses', 'dresses', 'فساتين عصرية لجميع المناسبات', 'Modern dresses for all occasions', 2),
  ('بدل', 'Suits', 'suits', 'بدل نسائية راقية', 'Elegant women suits', 3),
  ('كارديجان', 'Cardigans', 'cardigans', 'كارديجان مريح وأنيق', 'Comfortable and stylish cardigans', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name_ar, name_en, slug, description_ar, description_en, category_id, base_price, compare_at_price, sku, inventory_quantity, is_featured, is_active) 
SELECT 
  'عباية سوداء كلاسيكية', 
  'Classic Black Abaya', 
  'classic-black-abaya',
  'عباية سوداء أنيقة مصنوعة من قماش عالي الجودة، مثالية للمناسبات الرسمية',
  'Elegant black abaya made from high-quality fabric, perfect for formal occasions',
  c.id,
  299.00,
  399.00,
  'ABY-001',
  50,
  true,
  true
FROM categories c WHERE c.slug = 'abayas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name_ar, name_en, slug, description_ar, description_en, category_id, base_price, compare_at_price, sku, inventory_quantity, is_featured, is_active)
SELECT 
  'عباية مطرزة فاخرة',
  'Luxury Embroidered Abaya',
  'luxury-embroidered-abaya',
  'عباية فاخرة مع تطريز يدوي دقيق، تصميم حصري',
  'Luxury abaya with intricate hand embroidery, exclusive design',
  c.id,
  599.00,
  799.00,
  'ABY-002',
  30,
  true,
  true
FROM categories c WHERE c.slug = 'abayas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name_ar, name_en, slug, description_ar, description_en, category_id, base_price, sku, inventory_quantity, is_active)
SELECT 
  'فستان سهرة طويل',
  'Long Evening Dress',
  'long-evening-dress',
  'فستان سهرة أنيق بتصميم عصري، مناسب للحفلات والمناسبات الخاصة',
  'Elegant evening dress with modern design, suitable for parties and special occasions',
  c.id,
  450.00,
  'DRS-001',
  40,
  true
FROM categories c WHERE c.slug = 'dresses'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name_ar, name_en, slug, description_ar, description_en, category_id, base_price, sku, inventory_quantity, is_active)
SELECT 
  'بدلة نسائية رسمية',
  'Formal Women Suit',
  'formal-women-suit',
  'بدلة نسائية راقية مثالية للعمل والمناسبات الرسمية',
  'Elegant women suit perfect for work and formal occasions',
  c.id,
  550.00,
  'SUT-001',
  25,
  true
FROM categories c WHERE c.slug = 'suits'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name_ar, name_en, slug, description_ar, description_en, category_id, base_price, sku, inventory_quantity, is_active)
SELECT 
  'كارديجان صوف ناعم',
  'Soft Wool Cardigan',
  'soft-wool-cardigan',
  'كارديجان من الصوف الناعم، مريح ودافئ',
  'Soft wool cardigan, comfortable and warm',
  c.id,
  199.00,
  'CRD-001',
  60,
  false
FROM categories c WHERE c.slug = 'cardigans'
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants (sizes and colors)
INSERT INTO product_variants (product_id, name_ar, name_en, sku, price, size, color, color_hex, inventory_quantity)
SELECT 
  p.id,
  'مقاس صغير - أسود',
  'Small - Black',
  'ABY-001-S-BLK',
  299.00,
  'S',
  'أسود',
  '#000000',
  15
FROM products p WHERE p.slug = 'classic-black-abaya'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, name_ar, name_en, sku, price, size, color, color_hex, inventory_quantity)
SELECT 
  p.id,
  'مقاس متوسط - أسود',
  'Medium - Black',
  'ABY-001-M-BLK',
  299.00,
  'M',
  'أسود',
  '#000000',
  20
FROM products p WHERE p.slug = 'classic-black-abaya'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, name_ar, name_en, sku, price, size, color, color_hex, inventory_quantity)
SELECT 
  p.id,
  'مقاس كبير - أسود',
  'Large - Black',
  'ABY-001-L-BLK',
  299.00,
  'L',
  'أسود',
  '#000000',
  15
FROM products p WHERE p.slug = 'classic-black-abaya'
ON CONFLICT (sku) DO NOTHING;

-- Insert design settings
INSERT INTO design_settings (key, value, description) VALUES
  ('primary_color', '"#ec4899"', 'Primary brand color'),
  ('secondary_color', '"#8b5cf6"', 'Secondary brand color'),
  ('logo_url', '"/logo.png"', 'Store logo URL'),
  ('store_name_ar', '"مكة ستور"', 'Store name in Arabic'),
  ('store_name_en', '"Maka Store"', 'Store name in English'),
  ('hero_title_ar', '"أناقة لا تُضاهى"', 'Hero section title in Arabic'),
  ('hero_title_en', '"Unmatched Elegance"', 'Hero section title in English'),
  ('hero_subtitle_ar', '"اكتشفي أحدث صيحات الموضة النسائية"', 'Hero section subtitle in Arabic'),
  ('hero_subtitle_en', '"Discover the latest women fashion trends"', 'Hero section subtitle in English')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert page content
INSERT INTO page_content (page_path, page_title_ar, page_title_en, sections, is_published) VALUES
  ('/', 'الصفحة الرئيسية', 'Home Page', 
   '[
     {"type": "hero", "title_ar": "أناقة لا تُضاهى", "title_en": "Unmatched Elegance", "subtitle_ar": "اكتشفي أحدث صيحات الموضة النسائية", "subtitle_en": "Discover the latest women fashion trends"},
     {"type": "featured_products", "title_ar": "منتجات مميزة", "title_en": "Featured Products"},
     {"type": "categories", "title_ar": "تسوقي حسب الفئة", "title_en": "Shop by Category"}
   ]'::jsonb,
   true),
  ('/about', 'من نحن', 'About Us',
   '[
     {"type": "text", "title_ar": "من نحن", "title_en": "About Us", "content_ar": "نحن متجر متخصص في الأزياء النسائية العصرية", "content_en": "We are a store specialized in modern women fashion"}
   ]'::jsonb,
   true),
  ('/contact', 'تواصل معنا', 'Contact Us',
   '[
     {"type": "contact_form", "title_ar": "تواصل معنا", "title_en": "Contact Us"}
   ]'::jsonb,
   true)
ON CONFLICT (page_path) DO NOTHING;

-- Insert sample customer
INSERT INTO customers (email, full_name, phone) VALUES
  ('customer@example.com', 'عميلة تجريبية', '+966501234567')
ON CONFLICT (email) DO NOTHING;

-- Insert sample order
INSERT INTO orders (
  order_number, 
  customer_email, 
  customer_name, 
  customer_phone,
  status,
  payment_status,
  subtotal,
  shipping_cost,
  total,
  shipping_address_line1,
  shipping_city,
  shipping_country
) VALUES (
  'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  'customer@example.com',
  'عميلة تجريبية',
  '+966501234567',
  'pending',
  'pending',
  299.00,
  30.00,
  329.00,
  'شارع الملك فهد',
  'الرياض',
  'SA'
);

-- Insert order items for the sample order
INSERT INTO order_items (
  order_id,
  product_id,
  product_name_ar,
  product_name_en,
  sku,
  quantity,
  unit_price,
  total_price
)
SELECT 
  o.id,
  p.id,
  'عباية سوداء كلاسيكية',
  'Classic Black Abaya',
  'ABY-001',
  1,
  299.00,
  299.00
FROM orders o
CROSS JOIN products p
WHERE o.order_number LIKE 'ORD-%001'
  AND p.slug = 'classic-black-abaya'
LIMIT 1;
