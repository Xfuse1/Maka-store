-- إدراج 5 عملاء افتراضيين
INSERT INTO customers (id, email, full_name, phone)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'fatima.ahmed@example.com', 'فاطمة أحمد محمد', '+201012345678'),
  ('c2222222-2222-2222-2222-222222222222', 'sara.hassan@example.com', 'سارة حسن علي', '+201098765432'),
  ('c3333333-3333-3333-3333-333333333333', 'mona.ibrahim@example.com', 'منى إبراهيم خالد', '+201123456789'),
  ('c4444444-4444-4444-4444-444444444444', 'nour.mohamed@example.com', 'نور محمد عبدالله', '+201087654321'),
  ('c5555555-5555-5555-5555-555555555555', 'huda.salem@example.com', 'هدى سالم أحمد', '+201156789012')
ON CONFLICT (id) DO NOTHING;

-- إدراج 10 طلبات افتراضية بحالات مختلفة
INSERT INTO orders (
  id, order_number, customer_id, customer_email, customer_name, customer_phone,
  status, payment_status, payment_method,
  subtotal, shipping_cost, tax, discount, total,
  shipping_address_line1, shipping_city, shipping_country
) VALUES 
  -- طلب 1: مكتمل ومدفوع
  ('o1111111-1111-1111-1111-111111111111', 'ORD-2025-0001', 'c1111111-1111-1111-1111-111111111111', 
   'fatima.ahmed@example.com', 'فاطمة أحمد محمد', '+201012345678',
   'delivered', 'paid', 'credit_card',
   598.00, 50.00, 0, 59.80, 588.20,
   '15 شارع الجمهورية', 'القاهرة', 'EG'),
  
  -- طلب 2: قيد الشحن
  ('o2222222-2222-2222-2222-222222222222', 'ORD-2025-0002', 'c2222222-2222-2222-2222-222222222222',
   'sara.hassan@example.com', 'سارة حسن علي', '+201098765432',
   'shipped', 'paid', 'credit_card',
   449.00, 0, 0, 0, 449.00,
   '28 شارع النيل', 'الإسكندرية', 'EG'),
  
  -- طلب 3: قيد المعالجة
  ('o3333333-3333-3333-3333-333333333333', 'ORD-2025-0003', 'c3333333-3333-3333-3333-333333333333',
   'mona.ibrahim@example.com', 'منى إبراهيم خالد', '+201123456789',
   'processing', 'paid', 'cash_on_delivery',
   728.00, 50.00, 0, 0, 778.00,
   '42 شارع الهرم', 'الجيزة', 'EG'),
  
  -- طلب 4: معلق - بانتظار الدفع
  ('o4444444-4444-4444-4444-444444444444', 'ORD-2025-0004', 'c4444444-4444-4444-4444-444444444444',
   'nour.mohamed@example.com', 'نور محمد عبدالله', '+201087654321',
   'pending', 'pending', 'cash_on_delivery',
   358.00, 50.00, 0, 0, 408.00,
   '67 شارع الجلاء', 'المنصورة', 'EG'),
  
  -- طلب 5: مؤكد
  ('o5555555-5555-5555-5555-555555555555', 'ORD-2025-0005', 'c5555555-5555-5555-5555-555555555555',
   'huda.salem@example.com', 'هدى سالم أحمد', '+201156789012',
   'confirmed', 'paid', 'credit_card',
   897.00, 0, 0, 50.00, 847.00,
   '89 شارع الجامعة', 'طنطا', 'EG'),
  
  -- طلب 6: ملغي
  ('o6666666-6666-6666-6666-666666666666', 'ORD-2025-0006', 'c1111111-1111-1111-1111-111111111111',
   'fatima.ahmed@example.com', 'فاطمة أحمد محمد', '+201012345678',
   'cancelled', 'failed', 'credit_card',
   299.00, 50.00, 0, 0, 349.00,
   '15 شارع الجمهورية', 'القاهرة', 'EG'),
  
  -- طلب 7: مكتمل
  ('o7777777-7777-7777-7777-777777777777', 'ORD-2025-0007', 'c2222222-2222-2222-2222-222222222222',
   'sara.hassan@example.com', 'سارة حسن علي', '+201098765432',
   'delivered', 'paid', 'cash_on_delivery',
   548.00, 50.00, 0, 0, 598.00,
   '28 شارع النيل', 'الإسكندرية', 'EG'),
  
  -- طلب 8: قيد الشحن
  ('o8888888-8888-8888-8888-888888888888', 'ORD-2025-0008', 'c3333333-3333-3333-3333-333333333333',
   'mona.ibrahim@example.com', 'منى إبراهيم خالد', '+201123456789',
   'shipped', 'paid', 'credit_card',
   1047.00, 0, 0, 0, 1047.00,
   '42 شارع الهرم', 'الجيزة', 'EG'),
  
  -- طلب 9: معلق
  ('o9999999-9999-9999-9999-999999999999', 'ORD-2025-0009', 'c4444444-4444-4444-4444-444444444444',
   'nour.mohamed@example.com', 'نور محمد عبدالله', '+201087654321',
   'pending', 'pending', 'cash_on_delivery',
   179.00, 50.00, 0, 0, 229.00,
   '67 شارع الجلاء', 'المنصورة', 'EG'),
  
  -- طلب 10: مكتمل
  ('oaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ORD-2025-0010', 'c5555555-5555-5555-5555-555555555555',
   'huda.salem@example.com', 'هدى سالم أحمد', '+201156789012',
   'delivered', 'paid', 'credit_card',
   677.00, 50.00, 0, 67.70, 659.30,
   '89 شارع الجامعة', 'طنطا', 'EG')
ON CONFLICT (id) DO NOTHING;

-- إدراج عناصر الطلبات
INSERT INTO order_items (order_id, product_id, variant_id, product_name_ar, product_name_en, variant_name_ar, variant_name_en, quantity, unit_price, total_price)
SELECT 
  'o1111111-1111-1111-1111-111111111111',
  p.id,
  pv.id,
  p.name_ar,
  p.name_en,
  pv.name_ar,
  pv.name_en,
  2,
  pv.price,
  pv.price * 2
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.slug = 'classic-black-abaya'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, variant_id, product_name_ar, product_name_en, variant_name_ar, variant_name_en, quantity, unit_price, total_price)
SELECT 
  'o2222222-2222-2222-2222-222222222222',
  p.id,
  pv.id,
  p.name_ar,
  p.name_en,
  pv.name_ar,
  pv.name_en,
  1,
  pv.price,
  pv.price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.slug = 'luxurious-embroidered-abaya'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, variant_id, product_name_ar, product_name_en, variant_name_ar, variant_name_en, quantity, unit_price, total_price)
SELECT 
  'o3333333-3333-3333-3333-333333333333',
  p.id,
  pv.id,
  p.name_ar,
  p.name_en,
  pv.name_ar,
  pv.name_en,
  2,
  pv.price,
  pv.price * 2
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.slug = 'elegant-work-suit'
LIMIT 1
ON CONFLICT DO NOTHING;
