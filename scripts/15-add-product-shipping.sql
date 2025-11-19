-- Add shipping columns to products table so admin UI can set per-product shipping
-- Run this in your Supabase SQL editor (requires an admin or owner role)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_type VARCHAR(20) DEFAULT 'free';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Verify columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('shipping_type','shipping_cost');
