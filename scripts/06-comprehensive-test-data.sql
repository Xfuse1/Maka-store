-- حذف البيانات القديمة (اختياري - احذف هذا القسم إذا كنت تريد الاحتفاظ بالبيانات الموجودة)
-- TRUNCATE TABLE order_items, orders, cart_items, product_variants, product_images, products, categories, customers CASCADE;

-- إدراج التصنيفات السبعة
INSERT INTO categories (id, name_ar, name_en, slug, description_ar, description_en, display_order, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'عبايات', 'Abayas', 'abayas', 'عبايات أنيقة ومميزة', 'Elegant and distinctive abayas', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'كارديجانات', 'Cardigans', 'cardigans', 'كارديجانات عصرية ومريحة', 'Modern and comfortable cardigans', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'بدل', 'Suits', 'suits', 'بدل رسمية للعمل والمناسبات', 'Formal suits for work and occasions', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'سويت شيرت', 'Sweatshirts', 'sweatshirts', 'سويت شيرت كاجوال مريح', 'Comfortable casual sweatshirts', 4, true),
  ('55555555-5555-5555-5555-555555555555', 'درابست', 'Dresses', 'dresses', 'فساتين أنيقة لجميع المناسبات', 'Elegant dresses for all occasions', 5, true),
  ('66666666-6666-6666-6666-666666666666', 'بلوزات', 'Blouses', 'blouses', 'بلوزات عملية وأنيقة', 'Practical and elegant blouses', 6, true),
  ('77777777-7777-7777-7777-777777777777', 'جواكيت', 'Jackets', 'jackets', 'جواكيت شتوية دافئة', 'Warm winter jackets', 7, true)
ON CONFLICT (id) DO NOTHING;

-- إدراج 21 منتج (3 لكل تصنيف)
INSERT INTO products (id, name_ar, name_en, slug, description_ar, description_en, category_id, base_price, is_featured, is_active, tags)
VALUES 
  -- عبايات (3 منتجات)
  ('a1111111-1111-1111-1111-111111111111', 'عباية كلاسيكية سوداء', 'Classic Black Abaya', 'classic-black-abaya', 'عباية سوداء كلاسيكية من قماش الكريب الفاخر، مناسبة لجميع المناسبات', 'Classic black abaya made from luxurious crepe fabric, suitable for all occasions', '11111111-1111-1111-1111-111111111111', 299.00, true, true, ARRAY['عبايات', 'كلاسيك', 'أسود']),
  ('a1111111-1111-1111-1111-111111111112', 'عباية مطرزة فاخرة', 'Luxurious Embroidered Abaya', 'luxurious-embroidered-abaya', 'عباية مطرزة بتطريز يدوي فاخر على الأكمام والصدر', 'Embroidered abaya with luxurious hand embroidery on sleeves and chest', '11111111-1111-1111-1111-111111111111', 449.00, true, true, ARRAY['عبايات', 'مطرز', 'فاخر']),
  ('a1111111-1111-1111-1111-111111111113', 'عباية كاجوال يومية', 'Casual Daily Abaya', 'casual-daily-abaya', 'عباية كاجوال مريحة للاستخدام اليومي من قماش قطني مريح', 'Comfortable casual abaya for daily use made from comfortable cotton fabric', '11111111-1111-1111-1111-111111111111', 249.00, false, true, ARRAY['عبايات', 'كاجوال', 'يومي']),
  
  -- كارديجانات (3 منتجات)
  ('a2222222-2222-2222-2222-222222222221', 'كارديجان صوفي طويل', 'Long Wool Cardigan', 'long-wool-cardigan', 'كارديجان طويل من الصوف الناعم، مثالي للشتاء', 'Long cardigan made from soft wool, perfect for winter', '22222222-2222-2222-2222-222222222222', 199.00, true, true, ARRAY['كارديجان', 'صوف', 'شتوي']),
  ('a2222222-2222-2222-2222-222222222222', 'كارديجان قطني خفيف', 'Light Cotton Cardigan', 'light-cotton-cardigan', 'كارديجان قطني خفيف مناسب للربيع والخريف', 'Light cotton cardigan suitable for spring and autumn', '22222222-2222-2222-2222-222222222222', 149.00, false, true, ARRAY['كارديجان', 'قطن', 'خفيف']),
  ('a2222222-2222-2222-2222-222222222223', 'كارديجان أوفرسايز عصري', 'Trendy Oversized Cardigan', 'trendy-oversized-cardigan', 'كارديجان أوفرسايز بتصميم عصري وألوان جذابة', 'Oversized cardigan with modern design and attractive colors', '22222222-2222-2222-2222-222222222222', 229.00, true, true, ARRAY['كارديجان', 'أوفرسايز', 'عصري']),
  
  -- بدل (3 منتجات)
  ('a3333333-3333-3333-3333-333333333331', 'بدلة عمل أنيقة', 'Elegant Work Suit', 'elegant-work-suit', 'بدلة رسمية أنيقة مكونة من جاكيت وبنطلون، مثالية للعمل', 'Elegant formal suit consisting of jacket and trousers, perfect for work', '33333333-3333-3333-3333-333333333333', 399.00, true, true, ARRAY['بدلة', 'رسمي', 'عمل']),
  ('a3333333-3333-3333-3333-333333333332', 'بدلة سهرة فاخرة', 'Luxurious Evening Suit', 'luxurious-evening-suit', 'بدلة سهرة فاخرة بتصميم راقي للمناسبات الخاصة', 'Luxurious evening suit with elegant design for special occasions', '33333333-3333-3333-3333-333333333333', 549.00, true, true, ARRAY['بدلة', 'سهرة', 'فاخر']),
  ('a3333333-3333-3333-3333-333333333333', 'بدلة كاجوال سمارت', 'Smart Casual Suit', 'smart-casual-suit', 'بدلة كاجوال سمارت مناسبة للقاءات غير الرسمية', 'Smart casual suit suitable for informal meetings', '33333333-3333-3333-3333-333333333333', 349.00, false, true, ARRAY['بدلة', 'كاجوال', 'سمارت']),
  
  -- سويت شيرت (3 منتجات)
  ('a4444444-4444-4444-4444-444444444441', 'سويت شيرت قطني مريح', 'Comfortable Cotton Sweatshirt', 'comfortable-cotton-sweatshirt', 'سويت شيرت قطني مريح بتصميم بسيط وعملي', 'Comfortable cotton sweatshirt with simple and practical design', '44444444-4444-4444-4444-444444444444', 179.00, true, true, ARRAY['سويت شيرت', 'قطن', 'مريح']),
  ('a4444444-4444-4444-4444-444444444442', 'سويت شيرت بقبعة', 'Hooded Sweatshirt', 'hooded-sweatshirt', 'سويت شيرت مع قبعة، مثالي للطقس البارد', 'Sweatshirt with hood, perfect for cold weather', '44444444-4444-4444-4444-444444444444', 199.00, false, true, ARRAY['سويت شيرت', 'قبعة', 'شتوي']),
  ('a4444444-4444-4444-4444-444444444443', 'سويت شيرت بطبعة عصرية', 'Trendy Print Sweatshirt', 'trendy-print-sweatshirt', 'سويت شيرت بطبعة عصرية وألوان جذابة', 'Sweatshirt with trendy print and attractive colors', '44444444-4444-4444-4444-444444444444', 189.00, true, true, ARRAY['سويت شيرت', 'طبعة', 'عصري']),
  
  -- درابست (3 منتجات)
  ('a5555555-5555-5555-5555-555555555551', 'فستان حرير فاخر', 'Luxurious Silk Dress', 'luxurious-silk-dress', 'فستان من الحرير الفاخر بتصميم أنيق للمناسبات الخاصة', 'Luxurious silk dress with elegant design for special occasions', '55555555-5555-5555-5555-555555555555', 459.00, true, true, ARRAY['فستان', 'حرير', 'فاخر']),
  ('a5555555-5555-5555-5555-555555555552', 'فستان كاجوال صيفي', 'Summer Casual Dress', 'summer-casual-dress', 'فستان كاجوال خفيف مناسب للصيف', 'Light casual dress suitable for summer', '55555555-5555-5555-5555-555555555555', 219.00, false, true, ARRAY['فستان', 'صيفي', 'كاجوال']),
  ('a5555555-5555-5555-5555-555555555553', 'فستان سهرة طويل', 'Long Evening Dress', 'long-evening-dress', 'فستان سهرة طويل بتصميم راقي', 'Long evening dress with elegant design', '55555555-5555-5555-5555-555555555555', 499.00, true, true, ARRAY['فستان', 'سهرة', 'طويل']),
  
  -- بلوزات (3 منتجات)
  ('a6666666-6666-6666-6666-666666666661', 'بلوزة كاجوال أنيقة', 'Elegant Casual Blouse', 'elegant-casual-blouse', 'بلوزة كاجوال أنيقة مناسبة للعمل والخروج', 'Elegant casual blouse suitable for work and outings', '66666666-6666-6666-6666-666666666666', 229.00, true, true, ARRAY['بلوزة', 'كاجوال', 'أنيق']),
  ('a6666666-6666-6666-6666-666666666662', 'بلوزة حريرية فاخرة', 'Luxurious Silk Blouse', 'luxurious-silk-blouse', 'بلوزة من الحرير الفاخر بتصميم راقي', 'Luxurious silk blouse with elegant design', '66666666-6666-6666-6666-666666666666', 279.00, true, true, ARRAY['بلوزة', 'حرير', 'فاخر']),
  ('a6666666-6666-6666-6666-666666666663', 'بلوزة قطنية بسيطة', 'Simple Cotton Blouse', 'simple-cotton-blouse', 'بلوزة قطنية بسيطة للاستخدام اليومي', 'Simple cotton blouse for daily use', '66666666-6666-6666-6666-666666666666', 169.00, false, true, ARRAY['بلوزة', 'قطن', 'بسيط']),
  
  -- جواكيت (3 منتجات)
  ('a7777777-7777-7777-7777-777777777771', 'جاكيت شتوي دافئ', 'Warm Winter Jacket', 'warm-winter-jacket', 'جاكيت شتوي دافئ مبطن، مثالي للطقس البارد', 'Warm padded winter jacket, perfect for cold weather', '77777777-7777-7777-7777-777777777777', 349.00, true, true, ARRAY['جاكيت', 'شتوي', 'دافئ']),
  ('a7777777-7777-7777-7777-777777777772', 'جاكيت جلد أنيق', 'Elegant Leather Jacket', 'elegant-leather-jacket', 'جاكيت من الجلد الصناعي بتصميم أنيق وعصري', 'Faux leather jacket with elegant and modern design', '77777777-7777-7777-7777-777777777777', 399.00, true, true, ARRAY['جاكيت', 'جلد', 'أنيق']),
  ('a7777777-7777-7777-7777-777777777773', 'جاكيت رياضي خفيف', 'Light Sports Jacket', 'light-sports-jacket', 'جاكيت رياضي خفيف مناسب للربيع والخريف', 'Light sports jacket suitable for spring and autumn', '77777777-7777-7777-7777-777777777777', 269.00, false, true, ARRAY['جاكيت', 'رياضي', 'خفيف'])
ON CONFLICT (id) DO NOTHING;

-- إضافة صور للمنتجات
INSERT INTO product_images (product_id, image_url, alt_text_ar, alt_text_en, display_order, is_primary)
SELECT 
  id,
  '/placeholder.svg?height=600&width=400&query=' || slug,
  name_ar,
  name_en,
  0,
  true
FROM products
ON CONFLICT DO NOTHING;
