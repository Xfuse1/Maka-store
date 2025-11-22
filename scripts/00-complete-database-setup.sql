-- =====================================================
-- COMPLETE DATABASE SETUP FOR MAKASTORE5
-- This script sets up the entire database structure
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  sku TEXT UNIQUE,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  meta_title_ar TEXT,
  meta_title_en TEXT,
  meta_description_ar TEXT,
  meta_description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text_ar TEXT,
  alt_text_en TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  inventory_quantity INTEGER DEFAULT 0,
  size TEXT,
  color TEXT,
  color_hex TEXT,
  weight DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT NOT NULL DEFAULT 'SA',
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  notes TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_ar TEXT NOT NULL,
  product_name_en TEXT NOT NULL,
  variant_name_ar TEXT,
  variant_name_en TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id TEXT,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_variant_id),
  UNIQUE(session_id, product_variant_id)
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipping_fee DECIMAL(10, 2) DEFAULT 50.00,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 500.00,
  tax_rate DECIMAL(5, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'SAR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discount_coupons table
CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES discount_coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_settings table
CREATE TABLE IF NOT EXISTS design_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT UNIQUE NOT NULL,
  page_title_ar TEXT NOT NULL,
  page_title_en TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  meta_title_ar TEXT,
  meta_title_en TEXT,
  meta_description_ar TEXT,
  meta_description_en TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create homepage_sections table
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    section_type VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    max_items INTEGER DEFAULT 8,
    product_ids JSONB DEFAULT '[]'::jsonb,
    category_ids JSONB DEFAULT '[]'::jsonb,
    layout_type VARCHAR(50) DEFAULT 'grid',
    show_title BOOLEAN DEFAULT true,
    show_description BOOLEAN DEFAULT true,
    background_color VARCHAR(50) DEFAULT 'background',
    custom_content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_page_content_path ON page_content(page_path);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_settings_updated_at ON design_settings;
CREATE TRIGGER update_design_settings_updated_at BEFORE UPDATE ON design_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER trigger_update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Public read access for categories
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Public read access for products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Public read access for product images
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

-- Public read access for product variants
DROP POLICY IF EXISTS "Public can view active variants" ON product_variants;
CREATE POLICY "Public can view active variants" ON product_variants
  FOR SELECT USING (is_active = true);

-- Public read access for published page content
DROP POLICY IF EXISTS "Public can view published pages" ON page_content;
CREATE POLICY "Public can view published pages" ON page_content
  FOR SELECT USING (is_published = true);

-- Public read access for design settings
DROP POLICY IF EXISTS "Public can view design settings" ON design_settings;
CREATE POLICY "Public can view design settings" ON design_settings
  FOR SELECT USING (true);

-- Public read access for homepage sections
DROP POLICY IF EXISTS "Public can view active sections" ON homepage_sections;
CREATE POLICY "Public can view active sections" ON homepage_sections
  FOR SELECT USING (is_active = true);

-- =====================================================
-- INSERT SEED DATA
-- =====================================================

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

-- Insert product variants
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

-- Insert store settings
INSERT INTO store_settings (shipping_fee, free_shipping_threshold, tax_rate, currency)
VALUES (50.00, 500.00, 0.00, 'SAR')
ON CONFLICT DO NOTHING;

-- Insert discount coupons
INSERT INTO discount_coupons (code, discount_type, discount_value, min_purchase_amount, is_active, expires_at)
VALUES 
  ('WELCOME10', 'percentage', 10.00, 0, true, NOW() + INTERVAL '1 year'),
  ('FREESHIP', 'free_shipping', 0, 300.00, true, NOW() + INTERVAL '1 year'),
  ('SAVE50', 'fixed', 50.00, 200.00, true, NOW() + INTERVAL '6 months')
ON CONFLICT (code) DO NOTHING;

-- Insert design settings
INSERT INTO design_settings (key, value, description) VALUES
  ('primary_color', '"#ec4899"', 'Primary brand color'),
  ('secondary_color','"#ec4899"', 'Primary brand color'),
  ('logo_url', '"/logo.png"', 'Store logo URL'),
  ('store_name_ar', '"مكة ستور"', 'Store name in Arabic'),
  ('store_name_en', '"Maka Store"', 'Store name in English')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert homepage sections
INSERT INTO homepage_sections (name_ar, name_en, section_type, display_order, is_active, max_items, layout_type, background_color) VALUES
  ('الأكثر مبيعاً', 'Best Sellers', 'best_sellers', 1, true, 3, 'grid', 'background'),
  ('المنتجات الجديدة', 'New Products', 'new_arrivals', 2, true, 3, 'grid', 'background'),
  ('المنتجات المميزة', 'Featured Products', 'featured', 3, true, 3, 'grid', 'background'),
  ('تسوقي حسب الفئة', 'Shop by Category', 'categories', 4, true, 8, 'grid', 'background')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STORAGE SETUP
-- =====================================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('pages', 'pages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public read access
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
CREATE POLICY "Public can view category images" ON storage.objects
  FOR SELECT USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Public can view page images" ON storage.objects;
CREATE POLICY "Public can view page images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pages');
