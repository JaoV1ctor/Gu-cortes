-- ==========================================
-- 02: Tabela de Serviços (Supabase)
-- ==========================================

-- 1. Cria a tabela de serviços oferecidos
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY, -- Ex: 'corte', 'barba', 'combo' (simples pra urls e referencias curtas)
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'scissors',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilita RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
-- Clientes podem ler (SELECT) os serviços anonimamente
CREATE POLICY "Serviços são visíveis a todos (SELECT)" 
ON public.services 
FOR SELECT 
TO public 
USING (true);

-- Apenas o Service Role (Backend/Painel de controle autenticado) pode modificar
CREATE POLICY "Admins modificam serviços (ALL)" 
ON public.services 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Inserindo Serviços Padrão (Mock Data Inicial)
INSERT INTO public.services (id, name, price, "durationMinutes", description, icon)
VALUES 
  ('corte', 'Corte', 50.00, 40, 'Corte de cabelo com acabamento impecável.', 'scissors'),
  ('barba', 'Barba', 40.00, 30, 'Barboterapia com toalha quente e alinhamento.', 'beard'),
  ('combo', 'Combo (Corte + Barba)', 80.00, 70, 'O tratamento completo para o seu visual.', 'combo')
ON CONFLICT (id) DO NOTHING;
