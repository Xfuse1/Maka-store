-- استعلامات تجريبية لاختبار رحلة الشراء الكاملة

-- ============================================
-- 1. إضافة منتج إلى السلة
-- ============================================
-- مثال: إضافة عباية سوداء مقاس M للعميل
INSERT INTO cart_items (user_id, product_variant_id, quantity)
SELECT 
  'c1111111-1111-1111-1111-111111111111', -- معرف العميل
  pv.id,
  1
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.slug = 'classic-black-abaya' 
  AND pv.size = 'M'
  AND pv.color = 'أسود'
LIMIT 1
ON CONFLICT (user_id, product_variant_id) 
DO UPDATE SET 
  quantity = cart_items.quantity + 1,
  updated_at = NOW();

-- ============================================
-- 2. عرض محتويات السلة مع التفاصيل
-- ============================================
SELECT 
  ci.id as cart_item_id,
  p.name_ar as product_name,
  pv.name_ar as variant_name,
  pv.color,
  pv.size,
  pv.price as unit_price,
  ci.quantity,
  (pv.price * ci.quantity) as total_price,
  pv.inventory_quantity as stock_available
FROM cart_items ci
JOIN product_variants pv ON ci.product_variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE ci.user_id = 'c1111111-1111-1111-1111-111111111111';

-- ============================================
-- 3. حساب إجمالي السلة مع الشحن والخصم
-- ============================================
WITH cart_summary AS (
  SELECT 
    SUM(pv.price * ci.quantity) as subtotal,
    COUNT(*) as items_count
  FROM cart_items ci
  JOIN product_variants pv ON ci.product_variant_id = pv.id
  WHERE ci.user_id = 'c1111111-1111-1111-1111-111111111111'
),
store_config AS (
  SELECT 
    shipping_fee,
    free_shipping_threshold,
    tax_rate
  FROM store_settings
  LIMIT 1
)
SELECT 
  cs.subtotal,
  cs.items_count,
  CASE 
    WHEN cs.subtotal >= sc.free_shipping_threshold THEN 0
    ELSE sc.shipping_fee
  END as shipping_cost,
  (cs.subtotal * sc.tax_rate / 100) as tax,
  0 as discount, -- سيتم حسابه عند تطبيق كوبون
  cs.subtotal + 
  CASE 
    WHEN cs.subtotal >= sc.free_shipping_threshold THEN 0
    ELSE sc.shipping_fee
  END +
  (cs.subtotal * sc.tax_rate / 100) as total
FROM cart_summary cs, store_config sc;

-- ============================================
-- 4. تطبيق كوبون خصم
-- ============================================
-- التحقق من صلاحية الكوبون
SELECT 
  id,
  code,
  discount_type,
  discount_value,
  min_purchase_amount,
  is_active,
  CASE 
    WHEN expires_at IS NULL THEN true
    WHEN expires_at > NOW() THEN true
    ELSE false
  END as is_valid
FROM discount_coupons
WHERE code = 'WELCOME10'
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());

-- حساب قيمة الخصم
WITH cart_total AS (
  SELECT SUM(pv.price * ci.quantity) as subtotal
  FROM cart_items ci
  JOIN product_variants pv ON ci.product_variant_id = pv.id
  WHERE ci.user_id = 'c1111111-1111-1111-1111-111111111111'
),
coupon AS (
  SELECT * FROM discount_coupons WHERE code = 'WELCOME10'
)
SELECT 
  ct.subtotal,
  c.discount_type,
  c.discount_value,
  CASE 
    WHEN c.discount_type = 'percentage' THEN 
      LEAST(ct.subtotal * c.discount_value / 100, COALESCE(c.max_discount_amount, ct.subtotal))
    WHEN c.discount_type = 'fixed' THEN 
      LEAST(c.discount_value, ct.subtotal)
    ELSE 0
  END as discount_amount,
  ct.subtotal - CASE 
    WHEN c.discount_type = 'percentage' THEN 
      LEAST(ct.subtotal * c.discount_value / 100, COALESCE(c.max_discount_amount, ct.subtotal))
    WHEN c.discount_type = 'fixed' THEN 
      LEAST(c.discount_value, ct.subtotal)
    ELSE 0
  END as final_subtotal
FROM cart_total ct, coupon c
WHERE ct.subtotal >= c.min_purchase_amount;

-- ============================================
-- 5. إنشاء طلب جديد من السلة
-- ============================================
-- الخطوة 1: إنشاء الطلب
WITH new_order AS (
  INSERT INTO orders (
    order_number,
    customer_id,
    customer_email,
    customer_name,
    customer_phone,
    status,
    payment_status,
    payment_method,
    subtotal,
    shipping_cost,
    tax,
    discount,
    total,
    shipping_address_line1,
    shipping_city,
    shipping_country
  )
  SELECT 
    'ORD-' || TO_CHAR(NOW(), 'YYYY-MM-DD-') || LPAD(FLOOR(random() * 10000)::TEXT, 4, '0'),
    c.id,
    c.email,
    c.full_name,
    c.phone,
    'pending',
    'pending',
    'cash_on_delivery',
    598.00, -- من حساب السلة
    50.00,
    0,
    59.80, -- خصم 10%
    588.20,
    '15 شارع الجمهورية',
    'القاهرة',
    'EG'
  FROM customers c
  WHERE c.id = 'c1111111-1111-1111-1111-111111111111'
  RETURNING id, order_number
)
SELECT * FROM new_order;

-- الخطوة 2: نقل عناصر السلة إلى الطلب
-- (استخدم معرف الطلب من الخطوة السابقة)
/*
INSERT INTO order_items (
  order_id,
  product_id,
  variant_id,
  product_name_ar,
  product_name_en,
  variant_name_ar,
  variant_name_en,
  sku,
  quantity,
  unit_price,
  total_price,
  image_url
)
SELECT 
  'ORDER_ID_HERE', -- ضع معرف الطلب هنا
  p.id,
  pv.id,
  p.name_ar,
  p.name_en,
  pv.name_ar,
  pv.name_en,
  pv.sku,
  ci.quantity,
  pv.price,
  pv.price * ci.quantity,
  pi.image_url
FROM cart_items ci
JOIN product_variants pv ON ci.product_variant_id = pv.id
JOIN products p ON pv.product_id = p.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE ci.user_id = 'c1111111-1111-1111-1111-111111111111';
*/

-- الخطوة 3: تحديث المخزون
/*
UPDATE product_variants pv
SET inventory_quantity = pv.inventory_quantity - ci.quantity
FROM cart_items ci
WHERE ci.product_variant_id = pv.id
  AND ci.user_id = 'c1111111-1111-1111-1111-111111111111';
*/

-- الخطوة 4: حذف عناصر السلة
/*
DELETE FROM cart_items
WHERE user_id = 'c1111111-1111-1111-1111-111111111111';
*/

-- ============================================
-- 6. استعلامات مفيدة للإدارة
-- ============================================

-- عرض جميع الطلبات مع تفاصيلها
SELECT 
  o.order_number,
  o.customer_name,
  o.status,
  o.payment_status,
  o.total,
  o.created_at,
  COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_name, o.status, o.payment_status, o.total, o.created_at
ORDER BY o.created_at DESC;

-- عرض المنتجات الأكثر مبيعاً
SELECT 
  p.name_ar,
  p.name_en,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.total_price) as total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.name_ar, p.name_en
ORDER BY total_quantity_sold DESC
LIMIT 10;

-- عرض المنتجات منخفضة المخزون
SELECT 
  p.name_ar,
  pv.name_ar as variant_name,
  pv.inventory_quantity,
  p.low_stock_threshold
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.inventory_quantity <= p.low_stock_threshold
ORDER BY pv.inventory_quantity ASC;

-- إحصائيات المبيعات
SELECT 
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_revenue,
  AVG(o.total) as average_order_value,
  COUNT(DISTINCT o.customer_id) as unique_customers
FROM orders o
WHERE o.payment_status = 'paid';
