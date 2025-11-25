-- Create payment_offers table

create table if not exists payment_offers (
  id uuid default gen_random_uuid() primary key,
  payment_method text not null,
  discount_type text not null default 'percentage',
  discount_value numeric not null default 0,
  is_active boolean not null default false,
  start_date timestamptz,
  end_date timestamptz,
  min_order_amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index on payment_method + is_active for fast reads
create index if not exists idx_payment_offers_method_active on payment_offers (payment_method, is_active);
