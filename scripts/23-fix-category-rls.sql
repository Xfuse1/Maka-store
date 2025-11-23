-- Grant admin full access to categories

-- Admins can view all categories, active or not
CREATE POLICY "Admins can view all categories" ON public.categories
  FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Admins can insert new categories
CREATE POLICY "Admins can insert new categories" ON public.categories
  FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Admins can update any category
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Admins can delete any category
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');