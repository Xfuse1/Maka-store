-- Revert adding columns for hero slides from homepage_sections table
ALTER TABLE homepage_sections
DROP COLUMN IF EXISTS title_ar,
DROP COLUMN IF EXISTS title_en,
DROP COLUMN IF EXISTS subtitle_ar,
DROP COLUMN IF EXISTS subtitle_en,
DROP COLUMN IF EXISTS description_ar,
DROP COLUMN IF EXISTS description_en,
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS button_text_ar,
DROP COLUMN IF EXISTS button_text_en,
DROP COLUMN IF EXISTS button_link;
