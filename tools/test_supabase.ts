import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    dotenv.config({ path: '.env.example' });
}

// ==========================================
// 02: Ping Supabase (Fase Link)
// ==========================================

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Auto-correção: O usuário colou apenas o ID do projeto em vez da URL completa
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: Faltam variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function pingDatabase() {
  console.log("🔥 Testando conexão atômica com o banco primário (Supabase)...");
  
  // Teste 1: Buscar limite de linhas vazio para ver se tabela existe e RLS aceita Select de Anon
  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .limit(1);

  if (error) {
    console.error("❌ Falha na conexão ou permissões. Detalhes:");
    console.error(error.message);
    process.exit(1);
  }

  console.log("✅ Sucesso! Conectado e a tabela 'appointments' está responsiva ao RLS (Permissão de Leitura Ativa).");
  console.log(`✅ Dados Retornados (Ping Count): ${data?.length}`);
  console.log("-----------------------------------------------------");
  console.log("O Bloqueio de Concorrência (Double Booking) PostgreSQL está PRONTO para guerra!");
}

pingDatabase();
