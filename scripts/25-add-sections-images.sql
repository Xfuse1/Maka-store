-- Add sections_images JSONB column to store per-section image URLs separately
ALTER TABLE page_content
ADD COLUMN IF NOT EXISTS sections_images JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN page_content.sections_images IS 'Mapping of section keys to image URLs, e.g. {"story.image_url":"https://..."}';

-- Optional index for faster access to JSONB keys (if needed later)
CREATE INDEX IF NOT EXISTS idx_page_content_sections_images ON page_content USING GIN (sections_images);
