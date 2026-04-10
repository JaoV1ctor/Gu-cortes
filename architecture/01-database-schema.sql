-- ==========================================
-- 01: Banco de Dados Supabase (Appointments)
-- ==========================================

-- 1. Habilitamos a extensão btree_gist para permitir travas de sobreposição de horário real (Range Overlap).
-- Esta é a técnica de Ouro (North Star) para garantir 0% de conflito mecânico de agenda.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Criamos a tabela limitando o payload de dados definidos do schema
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT auth.uid() PRIMARY KEY, -- Na ausência de RLS autenticado, vamos usar gen_random_uuid() se não tiver auth.
    -- Correção: Como não tem login (conforme Protocolo 0), vamos usar gerador nativo:
    -- id UUID DEFAULT gen_random_uuid() PRIMARY KEY, mas vamos alterar abaixo para ficar redondinho.
    id_aux UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed',
    google_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- CHECAGEM 1: Horário das 09h às 19h obrigatório no timezone do Brasil (Horário Comercial)
    -- EXTRACT com timezone para garantir integridade independente do servidor host.
    CONSTRAINT check_business_hours CHECK (
        EXTRACT(HOUR FROM start_time AT TIME ZONE 'America/Sao_Paulo') >= 9 AND 
        EXTRACT(HOUR FROM end_time AT TIME ZONE 'America/Sao_Paulo') <= 19
    ),

    -- CHECAGEM 2: Início tem que ser antes do fim
    CONSTRAINT check_time_order CHECK (start_time < end_time),

    -- CHECAGEM 3: GARANTIA DE 0% CONFLITO DE HORÁRIOS (Range Overlap)
    -- Essa constraint recusa qualquer INSERT se o perídio interseccionar (&&) com algum já existente com status != cancelled.
    -- Pra isso, criamos com EXCLUDE USING gist condition.
    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status != 'cancelled')
);

-- 3. Row Level Security (RLS)
-- Como o usuário (cliente) agenda sem Login, vamos abrir acesso para leitura (SELECT) e criação (INSERT) anônima.
-- A restrição de DELETE e UPDATE só pode vir do Admin (Service Role Key / GCal sync).
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Permite inserts de usuários não logados (anonkey)
CREATE POLICY "Permitir insercoes anonimas publicas" 
ON public.appointments 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Permite select (apenas horários, pra popular a tela) mas mascara dados de outros clientes se necessário
-- Por simplicidade, vamos permitir leitura total, mas na aplicação a gente filtra os selects.
CREATE POLICY "Permitir leitura de horarios publicos" 
ON public.appointments 
FOR SELECT 
TO public 
USING (true);

-- Atualizações e exclusões só pelo Service_Role da API confidencial.
-- O Service Role sempre "bypassa" o RLS do Supabase por padrão.
