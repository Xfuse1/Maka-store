# دليل اختبار رحلة الشراء الكاملة

## نظرة عامة
هذا الدليل يشرح كيفية اختبار جميع مراحل رحلة الشراء في متجر الأزياء النسائية من البداية إلى النهاية.

## البيانات الافتراضية المتوفرة

### التصنيفات (7)
- عبايات (3 منتجات)
- كارديجانات (3 منتجات)
- بدل (3 منتجات)
- سويت شيرت (3 منتجات)
- درابست (3 منتجات)
- بلوزات (3 منتجات)
- جواكيت (3 منتجات)

### المنتجات (21 منتج)
كل منتج يحتوي على:
- 12 متغير (3 ألوان × 4 مقاسات)
- الألوان: أسود، بيج، بورجوندي
- المقاسات: S, M, L, XL
- أسعار متنوعة (149 - 549 جنيه)
- كميات مخزون واقعية (10-50 قطعة)

### العملاء (5)
- فاطمة أحمد محمد
- سارة حسن علي
- منى إبراهيم خالد
- نور محمد عبدالله
- هدى سالم أحمد

### الطلبات (10)
طلبات بحالات مختلفة: معلق، مؤكد، قيد الشحن، مكتمل، ملغي

### كوبونات الخصم (3)
- `WELCOME10`: خصم 10%
- `FREESHIP`: شحن مجاني (حد أدنى 300 جنيه)
- `SAVE50`: خصم 50 جنيه (حد أدنى 200 جنيه)

## خطوات تنفيذ السكريبتات

### 1. إنشاء الجداول الأساسية
\`\`\`bash
# تنفيذ السكريبتات بالترتيب
1. scripts/01-create-tables.sql
2. scripts/02-enable-rls.sql
3. scripts/05-add-cart-system.sql
\`\`\`

### 2. إضافة البيانات الافتراضية
\`\`\`bash
4. scripts/06-comprehensive-test-data.sql
5. scripts/07-product-variants-data.sql
6. scripts/08-test-customers-orders.sql
\`\`\`

### 3. اختبار الاستعلامات
\`\`\`bash
7. scripts/09-test-queries.sql
\`\`\`

## سيناريوهات الاختبار

### السيناريو 1: إضافة منتج إلى السلة
\`\`\`sql
-- 1. عرض المنتجات المتاحة
SELECT p.name_ar, pv.color, pv.size, pv.price, pv.inventory_quantity
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.slug = 'classic-black-abaya'
ORDER BY pv.color, pv.size;

-- 2. إضافة منتج للسلة
-- (راجع scripts/09-test-queries.sql للكود الكامل)

-- 3. التحقق من السلة
SELECT * FROM cart_items WHERE user_id = 'c1111111-1111-1111-1111-111111111111';
\`\`\`

### السيناريو 2: تحديث كمية المنتج في السلة
\`\`\`sql
UPDATE cart_items
SET quantity = 3, updated_at = NOW()
WHERE user_id = 'c1111111-1111-1111-1111-111111111111'
  AND product_variant_id = 'VARIANT_ID_HERE';
\`\`\`

### السيناريو 3: حساب إجمالي السلة
\`\`\`sql
-- راجع scripts/09-test-queries.sql للاستعلام الكامل
-- يتضمن: المجموع الفرعي، الشحن، الضريبة، الخصم، الإجمالي النهائي
\`\`\`

### السيناريو 4: تطبيق كوبون خصم
\`\`\`sql
-- 1. التحقق من صلاحية الكوبون
SELECT * FROM discount_coupons 
WHERE code = 'WELCOME10' AND is_active = true;

-- 2. حساب قيمة الخصم
-- (راجع scripts/09-test-queries.sql للكود الكامل)
\`\`\`

### السيناريو 5: إنشاء طلب جديد
\`\`\`sql
-- 1. إنشاء الطلب
-- 2. نقل عناصر السلة إلى الطلب
-- 3. تحديث المخزون
-- 4. حذف عناصر السلة
-- (راجع scripts/09-test-queries.sql للكود الكامل)
\`\`\`

### السيناريو 6: تتبع الطلب
\`\`\`sql
-- عرض تفاصيل الطلب
SELECT 
  o.*,
  json_agg(
    json_build_object(
      'product_name', oi.product_name_ar,
      'variant', oi.variant_name_ar,
      'quantity', oi.quantity,
      'price', oi.unit_price,
      'total', oi.total_price
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = 'ORD-2025-0001'
GROUP BY o.id;
\`\`\`

### السيناريو 7: تحديث حالة الطلب
\`\`\`sql
-- تأكيد الطلب
UPDATE orders
SET status = 'confirmed', payment_status = 'paid'
WHERE order_number = 'ORD-2025-0001';

-- شحن الطلب
UPDATE orders
SET status = 'shipped', shipped_at = NOW(), tracking_number = 'TRACK123456'
WHERE order_number = 'ORD-2025-0001';

-- تسليم الطلب
UPDATE orders
SET status = 'delivered', delivered_at = NOW()
WHERE order_number = 'ORD-2025-0001';
\`\`\`

## استعلامات مفيدة للإدارة

### إحصائيات المبيعات
\`\`\`sql
-- إجمالي المبيعات والطلبات
SELECT 
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value
FROM orders
WHERE payment_status = 'paid';

-- المبيعات حسب الحالة
SELECT status, COUNT(*) as count, SUM(total) as revenue
FROM orders
GROUP BY status;
\`\`\`

### تقارير المخزون
\`\`\`sql
-- المنتجات منخفضة المخزون
SELECT 
  p.name_ar,
  pv.color,
  pv.size,
  pv.inventory_quantity
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.inventory_quantity < 15
ORDER BY pv.inventory_quantity ASC;

-- قيمة المخزون الإجمالية
SELECT 
  SUM(pv.price * pv.inventory_quantity) as total_inventory_value
FROM product_variants pv;
\`\`\`

### تقارير العملاء
\`\`\`sql
-- أفضل العملاء
SELECT 
  c.full_name,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.payment_status = 'paid'
GROUP BY c.id, c.full_name
ORDER BY total_spent DESC
LIMIT 10;
\`\`\`

## نصائح الاختبار

1. **اختبر بالترتيب**: ابدأ من إضافة المنتج للسلة وانتهِ بإكمال الطلب
2. **تحقق من المخزون**: تأكد من تحديث الكميات بعد كل طلب
3. **اختبر الحالات الخاصة**: 
   - منتج نفد من المخزون
   - كوبون منتهي الصلاحية
   - طلب بدون شحن (فوق الحد الأدنى)
4. **راقب الأداء**: استخدم EXPLAIN ANALYZE لتحليل الاستعلامات البطيئة

## الخطوات التالية

بعد اختبار البيانات الافتراضية:
1. قم بتطوير واجهة المستخدم للمتجر
2. أضف API endpoints للعمليات الأساسية
3. نفذ نظام المصادقة والتفويض
4. أضف نظام الإشعارات (بريد إلكتروني، SMS)
5. نفذ بوابة الدفع الإلكتروني
