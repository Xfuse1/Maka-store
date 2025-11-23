-- Add url_image column to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS url_image TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN page_content.url_image IS 'URL of the main image for the page (optional)';
