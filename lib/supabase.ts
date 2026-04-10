import { createClient } from '@supabase/supabase-js';

// 1. Coleta os segredos de todas as variações possíveis para ser à prova de erros
const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// 2. Garante que a URL seja um link completo do Supabase
const supabaseUrl = rawUrl.includes('.') 
  ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) 
  : `https://${rawUrl}.supabase.co`;

// 3. Validação de segurança para não explodir o servidor
if (!rawUrl || !rawKey) {
  console.warn("⚠️ Supabase: Credenciais incompletas no .env.local");
}

// 4. Exporta o cliente único
export const supabase = createClient(supabaseUrl, rawKey);
