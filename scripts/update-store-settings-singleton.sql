-- Alter id column to text if it is not already (it might fail if constraints exist, but assuming standard setup)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'store_settings' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.store_settings ALTER COLUMN id DROP DEFAULT;
        ALTER TABLE public.store_settings ALTER COLUMN id TYPE text USING id::text;
    END IF;
END $$;

-- Insert singleton row if not exists
INSERT INTO public.store_settings (id, store_name, store_description)
VALUES ('singleton', 'مكة', 'متجر مكة للأزياء النسائية الراقية')
ON CONFLICT (id) DO NOTHING;

-- Delete rows that are not 'singleton' (optional cleanup)
-- DELETE FROM public.store_settings WHERE id != 'singleton';
