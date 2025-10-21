-- Update and add the 8 main product categories for Mecca Fashion Store

-- First, let's clear any test/incorrect categories (optional - comment out if you want to keep existing)
-- DELETE FROM categories WHERE slug IN ('test', 'sample');

-- Insert or update the 8 main categories
-- Using ON CONFLICT to update if exists, insert if not

-- 1. Abayas (عبايات)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'عبايات',
  'Abayas',
  'abayas',
  'عبايات أنيقة وعصرية لجميع المناسبات',
  'Elegant and modern abayas for all occasions',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 2. Cardigans (كارديجان)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'كارديجان',
  'Cardigans',
  'cardigans',
  'كارديجانات مريحة وأنيقة للإطلالات اليومية',
  'Comfortable and elegant cardigans for everyday looks',
  true,
  2,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 3. Suits (بدل)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'بدل',
  'Suits',
  'suits',
  'بدل رسمية وكاجوال بتصاميم عصرية',
  'Formal and casual suits with modern designs',
  true,
  3,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 4. Dresses (فساتين)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'فساتين',
  'Dresses',
  'dresses',
  'فساتين راقية لجميع المناسبات الخاصة',
  'Elegant dresses for all special occasions',
  true,
  4,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 5. Shirts (شيرتات)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'شيرتات',
  'Shirts',
  'shirts',
  'شيرتات عملية وأنيقة للاستخدام اليومي',
  'Practical and elegant shirts for daily use',
  true,
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 6. Jackets (جواكت)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'جواكت',
  'Jackets',
  'jackets',
  'جواكت أنيقة ودافئة لفصل الشتاء',
  'Elegant and warm jackets for winter season',
  true,
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 7. Blouses (بلوزات)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'بلوزات',
  'Blouses',
  'blouses',
  'بلوزات عصرية بتصاميم متنوعة',
  'Modern blouses with various designs',
  true,
  7,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- 8. Skirts (تنانير)
INSERT INTO categories (
  id,
  name_ar,
  name_en,
  slug,
  description_ar,
  description_en,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'تنانير',
  'Skirts',
  'skirts',
  'تنانير أنيقة بأطوال وتصاميم مختلفة',
  'Elegant skirts with different lengths and designs',
  true,
  8,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  updated_at = NOW();

-- Add unique constraint on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
  END IF;
END $$;
