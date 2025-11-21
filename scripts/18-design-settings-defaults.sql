-- 1) إنشاء جدول إعدادات التصميم (صف واحد بس)
create table if not exists public.design_settings (
  id uuid primary key default gen_random_uuid(),
  primary_color text not null default '#760614',
  secondary_color text not null default '#a13030',
  background_color text not null default '#ffffff',
  text_color text not null default '#1a1a1a',
  heading_font text not null default 'Cairo',
  body_font text not null default 'Cairo',
  updated_at timestamptz not null default now()
);

-- 2) ضامن إن فيه صف واحد بس (لو فاضي نضيف صف افتراضي)
insert into public.design_settings (
  primary_color,
  secondary_color,
  background_color,
  text_color,
  heading_font,
  body_font
)
select '#760614', '#a13030', '#ffffff', '#1a1a1a', 'Cairo', 'Cairo'
where not exists (select 1 from public.design_settings);


-- إضافة أعمدة اللوجو (لو مش موجودة)
alter table public.design_settings
  add column if not exists logo_bucket text not null default 'site-logo',
  add column if not exists logo_path text not null default 'logo.png';

-- إضافة عمود يحدد الإعدادات الحالية للموقع
alter table public.design_settings
add column if not exists site_key text not null default 'default';

-- نجبر الجدول إنه يحتوي على site_key واحد فقط (unique)
alter table public.design_settings
add constraint design_settings_site_key_unique unique (site_key);
