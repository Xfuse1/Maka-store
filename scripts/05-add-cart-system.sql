-- إضافة جدول سلة التسوق
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id TEXT, -- للزوار غير المسجلين
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_variant_id),
  UNIQUE(session_id, product_variant_id)
);

-- إضافة جدول إعدادات المتجر
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipping_fee DECIMAL(10, 2) DEFAULT 50.00,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 500.00,
  tax_rate DECIMAL(5, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'EGP',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة جدول كوبونات الخصم
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

-- إضافة جدول استخدام الكوبونات
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES discount_coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at 
  BEFORE UPDATE ON store_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج إعدادات المتجر الافتراضية
INSERT INTO store_settings (shipping_fee, free_shipping_threshold, tax_rate, currency)
VALUES (50.00, 500.00, 0.00, 'EGP')
ON CONFLICT DO NOTHING;

-- إدراج كوبونات الخصم
INSERT INTO discount_coupons (code, discount_type, discount_value, min_purchase_amount, is_active, expires_at)
VALUES 
  ('WELCOME10', 'percentage', 10.00, 0, true, NOW() + INTERVAL '1 year'),
  ('FREESHIP', 'free_shipping', 0, 300.00, true, NOW() + INTERVAL '1 year'),
  ('SAVE50', 'fixed', 50.00, 200.00, true, NOW() + INTERVAL '6 months')
ON CONFLICT (code) DO NOTHING;
