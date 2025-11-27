-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text,
  store_description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Add columns if table exists but columns miss
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_name') THEN
        ALTER TABLE public.store_settings ADD COLUMN store_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_description') THEN
        ALTER TABLE public.store_settings ADD COLUMN store_description text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'updated_by') THEN
        ALTER TABLE public.store_settings ADD COLUMN updated_by uuid REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE public.store_settings ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "public read settings" ON public.store_settings;
CREATE POLICY "public read settings" ON public.store_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin update settings" ON public.store_settings;
CREATE POLICY "admin update settings" ON public.store_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin insert settings" ON public.store_settings;
CREATE POLICY "admin insert settings" ON public.store_settings
  FOR INSERT USING (auth.role() = 'authenticated');

-- Insert default row if empty
INSERT INTO public.store_settings (store_name, store_description)
SELECT 'مكة', 'متجر مكة للأزياء النسائية الراقية'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);
