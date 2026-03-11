-- 1. Create Platform Admins table
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add current developer as platform admin
-- IMPORTANT: Run this with the correct user ID if known, or by email
INSERT INTO public.platform_admins (user_id)
SELECT id FROM auth.users WHERE email = 'christian.teste2@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Create helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS Policies to use the new table instead of hardcoded email
-- Shops
DROP POLICY IF EXISTS "Admin/SuperAdmin view shops" ON public.shops;
CREATE POLICY "Admin/SuperAdmin view shops" ON public.shops 
FOR SELECT USING (
  id IN (SELECT public.get_user_shops()) 
  OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "SuperAdmin insert shops" ON public.shops;
CREATE POLICY "SuperAdmin insert shops" ON public.shops 
FOR INSERT WITH CHECK (
  public.is_platform_admin()
);

-- Memberships
DROP POLICY IF EXISTS "Admin/SuperAdmin view memberships" ON public.memberships;
CREATE POLICY "Admin/SuperAdmin view memberships" ON public.memberships 
FOR SELECT USING (
  user_id = auth.uid() 
  OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "SuperAdmin manage memberships" ON public.memberships;
CREATE POLICY "SuperAdmin manage memberships" ON public.memberships 
FOR ALL USING (
  public.is_platform_admin()
);

-- Settings
DROP POLICY IF EXISTS "Tenant access settings" ON public.settings;
CREATE POLICY "Tenant access settings" ON public.settings 
FOR ALL USING (
  shop_id IN (SELECT public.get_user_shops())
  OR public.is_platform_admin()
);
