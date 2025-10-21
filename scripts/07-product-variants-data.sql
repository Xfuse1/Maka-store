-- إنشاء متغيرات المنتجات (3 ألوان × 4 مقاسات لكل منتج = 12 متغير لكل منتج)
-- الألوان: أسود، بيج، بورجوندي
-- المقاسات: S, M, L, XL

DO $$
DECLARE
  product_record RECORD;
  color_record RECORD;
  size_record RECORD;
  variant_price DECIMAL(10, 2);
  variant_sku TEXT;
  stock_qty INTEGER;
BEGIN
  -- الألوان المتاحة
  CREATE TEMP TABLE temp_colors (
    name_ar TEXT,
    name_en TEXT,
    hex TEXT
  );
  
  INSERT INTO temp_colors VALUES
    ('أسود', 'Black', '#000000'),
    ('بيج', 'Beige', '#F5F5DC'),
    ('بورجوندي', 'Burgundy', '#800020');
  
  -- المقاسات المتاحة
  CREATE TEMP TABLE temp_sizes (
    size TEXT
  );
  
  INSERT INTO temp_sizes VALUES ('S'), ('M'), ('L'), ('XL');
  
  -- حلقة على جميع المنتجات
  FOR product_record IN SELECT id, base_price, slug FROM products LOOP
    -- حلقة على الألوان
    FOR color_record IN SELECT * FROM temp_colors LOOP
      -- حلقة على المقاسات
      FOR size_record IN SELECT * FROM temp_sizes LOOP
        -- حساب السعر (±10% من السعر الأساسي)
        variant_price := product_record.base_price + (product_record.base_price * (random() * 0.2 - 0.1));
        variant_price := ROUND(variant_price, 2);
        
        -- إنشاء SKU فريد
        variant_sku := UPPER(SUBSTRING(product_record.slug FROM 1 FOR 3)) || '-' || 
                       UPPER(SUBSTRING(color_record.name_en FROM 1 FOR 3)) || '-' || 
                       size_record.size || '-' || 
                       LPAD(FLOOR(random() * 1000)::TEXT, 3, '0');
        
        -- كمية المخزون العشوائية (10-50)
        stock_qty := 10 + FLOOR(random() * 41)::INTEGER;
        
        -- إدراج المتغير
        INSERT INTO product_variants (
          product_id,
          name_ar,
          name_en,
          sku,
          price,
          inventory_quantity,
          size,
          color,
          color_hex,
          is_active
        ) VALUES (
          product_record.id,
          color_record.name_ar || ' - ' || size_record.size,
          color_record.name_en || ' - ' || size_record.size,
          variant_sku,
          variant_price,
          stock_qty,
          size_record.size,
          color_record.name_ar,
          color_record.hex,
          true
        )
        ON CONFLICT (sku) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
  
  DROP TABLE temp_colors;
  DROP TABLE temp_sizes;
END $$;
