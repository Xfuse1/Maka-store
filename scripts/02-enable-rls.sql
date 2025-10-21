-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public read access for categories (everyone can view)
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Public read access for products (everyone can view active products)
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Public read access for product images
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

-- Public read access for product variants
CREATE POLICY "Public can view active variants" ON product_variants
  FOR SELECT USING (is_active = true);

-- Public read access for published page content
CREATE POLICY "Public can view published pages" ON page_content
  FOR SELECT USING (is_published = true);

-- Customers can view their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

-- Customers can update their own data
CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id::text = auth.uid()::text);

-- Customers can view their own order items
CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id::text = auth.uid()::text
    )
  );

-- Public read access for design settings
CREATE POLICY "Public can view design settings" ON design_settings
  FOR SELECT USING (true);

-- Note: Admin policies would be added here with proper authentication
-- For now, you'll need to manage admin access through service role key
