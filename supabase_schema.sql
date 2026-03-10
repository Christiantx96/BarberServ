-- 1. Create Tables

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Barbers
CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules (Barber work hours)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans (Subscriptions)
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_renewal DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. PERMISSIVE POLICIES FOR DEVELOPMENT

-- Customers
CREATE POLICY "Permissive read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Permissive insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Permissive delete customers" ON public.customers FOR DELETE USING (true);

-- Barbers
CREATE POLICY "Permissive read barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Permissive insert barbers" ON public.barbers FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update barbers" ON public.barbers FOR UPDATE USING (true);
CREATE POLICY "Permissive delete barbers" ON public.barbers FOR DELETE USING (true);

-- Services
CREATE POLICY "Permissive read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Permissive insert services" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update services" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Permissive delete services" ON public.services FOR DELETE USING (true);

-- Schedules
CREATE POLICY "Permissive read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Permissive insert schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update schedules" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Permissive delete schedules" ON public.schedules FOR DELETE USING (true);

-- Appointments
CREATE POLICY "Permissive read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Permissive insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Permissive delete appointments" ON public.appointments FOR DELETE USING (true);

-- Products
CREATE POLICY "Permissive read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permissive insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permissive delete products" ON public.products FOR DELETE USING (true);

-- Plans
CREATE POLICY "Permissive read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Permissive insert plans" ON public.plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update plans" ON public.plans FOR UPDATE USING (true);
CREATE POLICY "Permissive delete plans" ON public.plans FOR DELETE USING (true);

-- Subscriptions
CREATE POLICY "Permissive read subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Permissive insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update subscriptions" ON public.subscriptions FOR UPDATE USING (true);
CREATE POLICY "Permissive delete subscriptions" ON public.subscriptions FOR DELETE USING (true);

-- Payments
CREATE POLICY "Permissive read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Permissive insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permissive update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Permissive delete payments" ON public.payments FOR DELETE USING (true);
