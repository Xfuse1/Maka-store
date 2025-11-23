-- Database Performance Optimization: Add Strategic Indexes
-- Run this script to improve query performance across all tables

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_base_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_inventory ON products(inventory_quantity) WHERE track_inventory = true;

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id) WHERE is_primary = true;

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(product_id, is_active) WHERE is_active = true;

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
-- NOTE: column is named `variant_id` in `order_items` table (not `product_variant_id`)
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Homepage sections indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(display_order);

-- Hero slides indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(display_order);

-- Analytics events indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
-- Use `event_name` column (analytics_events defines `event_name`, not `event_type`)
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id) WHERE user_id IS NOT NULL;

-- User profiles indexes
-- Guarded creation: some deployments use `profiles` (id = auth.users.id) instead of `user_profiles`.
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)';
	ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
		-- `profiles.id` is the primary key referencing auth.users(id); an index on id already exists (PK).
		-- Create an index on `role` to speed role-based queries if not present.
		IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_profiles_role') THEN
			EXECUTE 'CREATE INDEX idx_profiles_role ON profiles(role)';
		END IF;
	END IF;
END;
$$;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(is_featured, is_active) WHERE is_featured = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_products_category_id IS 'Optimize category page queries';
COMMENT ON INDEX idx_orders_created_at IS 'Optimize order history and recent orders queries';
COMMENT ON INDEX idx_products_is_featured IS 'Optimize featured products display on homepage';

-- Analyze tables to update statistics
ANALYZE products;
ANALYZE product_images;
ANALYZE product_variants;
ANALYZE orders;
ANALYZE order_items;
ANALYZE categories;
ANALYZE customers;
