-- Create payment_offers table
CREATE TABLE IF NOT EXISTS payment_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_method TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_offers ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do everything
CREATE POLICY "Admins can do everything on payment_offers"
  ON payment_offers
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Public (or authenticated users) can read active offers
CREATE POLICY "Public can read active offers"
  ON payment_offers FOR SELECT
  USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_payment_offers_updated_at BEFORE UPDATE ON payment_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
