-- Create contact_messages table

create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  email text,
  phone text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_contact_messages_created_at on contact_messages (created_at desc);
create index if not exists idx_contact_messages_is_read on contact_messages (is_read);
