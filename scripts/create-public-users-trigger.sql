-- Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  image_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, image_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'image_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    image_url = COALESCE(EXCLUDED.image_url, public.users.image_url),
    role = COALESCE(EXCLUDED.role, public.users.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth.users to public.users
INSERT INTO public.users (id, email, name, phone, image_url, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'image_url', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'user'),
  au.created_at,
  au.updated_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.users.name),
  phone = COALESCE(EXCLUDED.phone, public.users.phone),
  image_url = COALESCE(EXCLUDED.image_url, public.users.image_url),
  role = COALESCE(EXCLUDED.role, public.users.role),
  updated_at = EXCLUDED.updated_at;

-- RLS Policies for public.users
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Service role can do anything" ON public.users;

-- Allow users to read their own data
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to do anything (for admin operations)
CREATE POLICY "Service role can do anything"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
