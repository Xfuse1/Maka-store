-- AI Product Recommendations Table
-- Caches AI-generated similar product recommendations with 24h TTL
-- Author: AI Product Recommendations Feature
-- Date: 2025-12-17

-- Create product_recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  recommended_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT recommended_ids_is_array CHECK (jsonb_typeof(recommended_ids) = 'array')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_recommendations_updated_at
  ON product_recommendations(updated_at DESC);

-- Comment on table
COMMENT ON TABLE product_recommendations IS
  'Caches AI-generated product recommendations with 24h TTL to avoid per-view LLM calls';

COMMENT ON COLUMN product_recommendations.product_id IS
  'Product ID (primary key, references products.id)';

COMMENT ON COLUMN product_recommendations.recommended_ids IS
  'JSON array of recommended product UUIDs, e.g. ["uuid1", "uuid2", ...]';

COMMENT ON COLUMN product_recommendations.updated_at IS
  'Last time recommendations were generated/updated. Cache TTL: 24 hours';

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_product_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on UPDATE
DROP TRIGGER IF EXISTS update_product_recommendations_timestamp_trigger
  ON product_recommendations;

CREATE TRIGGER update_product_recommendations_timestamp_trigger
  BEFORE UPDATE ON product_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_product_recommendations_timestamp();

-- Grant permissions (adjust based on your RLS setup)
-- GRANT SELECT ON product_recommendations TO anon, authenticated;
-- GRANT ALL ON product_recommendations TO service_role;

-- Example: Check if cache is fresh (< 24 hours old)
-- SELECT * FROM product_recommendations
-- WHERE product_id = 'some-uuid'
--   AND updated_at > NOW() - INTERVAL '24 hours';

-- Example: Upsert new recommendations
-- INSERT INTO product_recommendations (product_id, recommended_ids)
-- VALUES ('some-uuid', '["uuid1", "uuid2", "uuid3"]'::jsonb)
-- ON CONFLICT (product_id)
-- DO UPDATE SET
--   recommended_ids = EXCLUDED.recommended_ids,
--   updated_at = NOW();
