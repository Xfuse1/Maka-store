-- Ensure design settings entries exist with default values
-- This script should be run after 01-create-tables.sql

-- Insert default colors if not exists
INSERT INTO design_settings (key, value, description)
VALUES (
  'colors',
  '{
    "primary": "#FFB6C1",
    "background": "#FFFFFF",
    "foreground": "#1a1a1a"
  }'::jsonb,
  'Site color scheme'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default fonts if not exists
INSERT INTO design_settings (key, value, description)
VALUES (
  'fonts',
  '{
    "heading": "Cairo",
    "body": "Cairo"
  }'::jsonb,
  'Site font settings'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default layout if not exists
INSERT INTO design_settings (key, value, description)
VALUES (
  'layout',
  '{
    "containerWidth": "1280px",
    "radius": "0.5rem"
  }'::jsonb,
  'Site layout settings'
)
ON CONFLICT (key) DO NOTHING;
