import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { dotenv.config({ path: '.env.example' }); }

// ==========================================
// 04: Teste de Colisão (Concorrência Severa)
// ==========================================
// Vamos simular dois clientes clicando em "Confirmar" no mesmo exato milissegundo 
// para o mesmo lote de horário do barbeiro.

const API_URL = (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') ? `${process.env.APP_URL}/api/agendar` : 'http://localhost:3000/api/agendar';

async function crashTest() {
  console.log(`🔥 Iniciando Crash Test de Concorrência para [${API_URL}]...`);
  
  // Data alvo fictícia para amanhã às 14h
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);
  startTime.setHours(14, 0, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 40); // 40 minutos de corte

  const payloadBase = {
    service_id: 'corte',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  };

  const request1 = fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payloadBase, client_name: 'Cliente Flash (Esquerda)', client_phone: '11999999991' })
  });

  const request2 = fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payloadBase, client_name: 'Cliente Zoom (Direita)', client_phone: '11999999992' })
  });

  console.log("⚡ Disparando as 2 requisições ao mesmo tempo...");
  
  const [res1, res2] = await Promise.all([request1, request2]);
  
  const data1 = await res1.json();
  const data2 = await res2.json();

  console.log("\n📦 Resultado do Cliente 1:", res1.status, data1);
  console.log("📦 Resultado do Cliente 2:", res2.status, data2);
  
  console.log("\n-----------------------------------------------------");
  if (res1.status === 200 && res2.status === 200) {
    console.error("❌ FALHA CATASTRÓFICA! O banco de dados permitiu overbooking!");
  } else if (res1.status === 409 || res2.status === 409) {
    console.log("✅ CRASH TEST PASSOU! A trava mágica do Supabase matou a segunda requisição no ar!");
    console.log("✅ Estrela Guia Atingida: 0% de chances de conflito de agenda.");
  } else {
    console.log("⚠️ Verifique os logs acima para entender o comportamento. Código não esperado.");
  }
}

crashTest();
