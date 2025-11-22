-- =====================================================
-- HOMEPAGE SECTIONS MANAGEMENT SYSTEM
-- Complete database schema with auto-population
-- =====================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS homepage_sections CASCADE;

-- Create homepage_sections table
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    section_type VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Content Configuration
    max_items INTEGER DEFAULT 8,
    product_ids JSONB DEFAULT '[]'::jsonb,
    category_ids JSONB DEFAULT '[]'::jsonb,
    
    -- Display Settings
    layout_type VARCHAR(50) DEFAULT 'grid',
    show_title BOOLEAN DEFAULT true,
    show_description BOOLEAN DEFAULT true,
    background_color VARCHAR(50) DEFAULT 'background',
    
    -- Custom Content
    custom_content JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX idx_homepage_sections_order ON homepage_sections(display_order);
CREATE INDEX idx_homepage_sections_type ON homepage_sections(section_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_homepage_sections_updated_at
    BEFORE UPDATE ON homepage_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_sections_updated_at();

-- =====================================================
-- AUTO-POPULATE EXISTING SECTIONS
-- Automatically detect and insert current homepage sections
-- =====================================================

INSERT INTO homepage_sections (name_ar, name_en, section_type, display_order, is_active, max_items, layout_type, background_color, show_title, show_description) VALUES
-- Best Sellers Section (Hero Layout)
('الأكثر مبيعاً', 'Best Sellers', 'best_sellers', 1, true, 1, 'hero', 'secondary', true, true),

-- New Products Section (Grid Layout)
('المنتجات الجديدة', 'New Products', 'new_arrivals', 2, true, 3, 'grid', 'background', true, true),

-- Featured Products Section (Grid Layout)
('المنتجات المميزة', 'Featured Products', 'featured', 3, true, 3, 'grid', 'secondary', true, true),

-- Categories Section (Grid Layout)
('تسوقي حسب الفئة', 'Shop by Category', 'categories', 4, true, 8, 'grid', 'background', true, false),

-- Customer Reviews Section (Grid Layout)
('آراء العملاء', 'Customer Reviews', 'reviews', 5, true, 6, 'grid', 'background', true, true);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active sections
CREATE POLICY "Public can view active sections"
    ON homepage_sections
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to view all sections
CREATE POLICY "Authenticated users can view all sections"
    ON homepage_sections
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to manage sections
CREATE POLICY "Authenticated users can insert sections"
    ON homepage_sections
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update sections"
    ON homepage_sections
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete sections"
    ON homepage_sections
    FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to reorder sections
CREATE OR REPLACE FUNCTION reorder_homepage_sections(section_ids UUID[])
RETURNS void AS $$
DECLARE
    section_id UUID;
    new_order INTEGER := 0;
BEGIN
    FOREACH section_id IN ARRAY section_ids
    LOOP
        UPDATE homepage_sections
        SET display_order = new_order
        WHERE id = section_id;
        new_order := new_order + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify sections were created
SELECT 
    name_ar,
    section_type,
    display_order,
    is_active,
    max_items,
    layout_type
FROM homepage_sections
ORDER BY display_order;
