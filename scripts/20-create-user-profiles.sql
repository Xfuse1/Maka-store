-- إضافة عمود role إلى جدول profiles الموجود
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- تحديث القيم الموجودة لتكون user إذا كانت NULL
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- سياسة: المسؤولون يمكنهم قراءة كل البيانات
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
      
    )
  );

-- مثال: تحديث مستخدم موجود ليكون admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';

