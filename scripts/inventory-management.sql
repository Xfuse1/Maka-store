-- Function to decrease inventory for a variant
-- Returns TRUE if successful, FALSE if not enough stock or variant not found
CREATE OR REPLACE FUNCTION decrease_inventory(variant_id UUID, qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT inventory_quantity INTO current_qty
  FROM product_variants
  WHERE id = variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF current_qty >= qty THEN
    UPDATE product_variants
    SET inventory_quantity = inventory_quantity - qty
    WHERE id = variant_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Function to increase inventory for a variant
-- Returns TRUE if successful, FALSE if variant not found
CREATE OR REPLACE FUNCTION increase_inventory(variant_id UUID, qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_variants
  SET inventory_quantity = inventory_quantity + qty
  WHERE id = variant_id;
  
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
