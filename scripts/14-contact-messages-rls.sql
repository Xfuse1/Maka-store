-- Enable Row-Level Security for contact_messages
-- Allow public inserts (so contact form can submit)
-- Prevent selects/updates/deletes from non-service roles (so only service_role can manage messages)

BEGIN;

-- Enable RLS
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to INSERT messages via PostgREST
-- Note: some Postgres versions do not support IF NOT EXISTS with CREATE POLICY
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'contact_messages' AND policyname = 'public_insert') THEN
    -- For INSERT policies Postgres only allows WITH CHECK (no USING)
    CREATE POLICY public_insert ON contact_messages
      FOR INSERT
      WITH CHECK (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'contact_messages' AND policyname = 'deny_select_public') THEN
    CREATE POLICY deny_select_public ON contact_messages
      FOR SELECT
      USING (false);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'contact_messages' AND policyname = 'deny_update_public') THEN
    CREATE POLICY deny_update_public ON contact_messages
      FOR UPDATE
      USING (false);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = current_schema() AND tablename = 'contact_messages' AND policyname = 'deny_delete_public') THEN
    CREATE POLICY deny_delete_public ON contact_messages
      FOR DELETE
      USING (false);
  END IF;
END$$;

COMMIT;
