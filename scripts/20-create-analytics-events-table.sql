-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NULL, -- Supabase auth UID if available
  user_name text NULL, -- Display name / email / phone if available
  event_name text NOT NULL, -- e.g. "PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase", "Search"
  page_url text NULL,
  referrer text NULL,
  session_id text NULL,
  product_id text NULL,
  product_name text NULL,
  product_price numeric NULL,
  product_currency text NULL,
  order_id text NULL,
  order_total numeric NULL,
  order_currency text NULL,
  meta_event_id text NULL, -- if we ever want to join Meta Pixel IDs
  raw_payload jsonb NULL, -- full original payload (for debugging)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name_created_at ON public.analytics_events (event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id_created_at ON public.analytics_events (product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_created_at ON public.analytics_events (user_id, created_at);

-- Enable RLS but allowing insert for authenticated/anon users if needed via API
-- Since we use Admin client in API route, we might not need public policies, but good to have RLS enabled.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow read access to admins (if using service role, this is bypassed anyway)
-- Allow insert only via service role (API route) is safest.
