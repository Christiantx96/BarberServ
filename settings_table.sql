-- Tabela de Configurações da Barbearia
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_name TEXT NOT NULL DEFAULT 'BarberOS',
  address TEXT,
  phone TEXT,
  instagram TEXT,
  opening_hours TEXT,
  primary_color TEXT DEFAULT '#f59e0b',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração inicial se não existir
INSERT INTO public.settings (barbershop_name)
SELECT 'BarberOS'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- RLS para Settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização para administradores" ON public.settings
    FOR UPDATE USING (true); -- Em prod, restringir a roles admin
