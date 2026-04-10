
const API_URL = 'http://localhost:3000/api/agendar';

async function testFullFlow() {
  console.log("🔍 Iniciando Teste Fim-a-Fim...");

  // Data predefinida para teste (amanhã às 10:00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  const startTime = new Date(`${dateStr}T11:00:00-03:00`); // Horário BR
  const endTime = new Date(startTime.getTime() + 40 * 60000); // +40 min

  console.log(`\n1️⃣ Tentando Agendar: ${dateStr} às 11:00`);
  
  // POST Request
  const postRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: 'Guillaume Teste End-to-End',
      client_phone: '11999999999',
      service_id: 'corte',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    })
  });

  const postData = await postRes.json();
  
  if (postRes.ok) {
    console.log("✅ Agendamento Realizado com Sucesso!");
    console.log(`   ID no Supabase: ${postData.appointment.id}`);
    console.log(`   ID no Google Calendar: ${postData.appointment.google_event_id}`);
  } else {
    console.log(`⚠️ Falha ao Agendar (Status ${postRes.status}):`, postData.error);
    if (postRes.status === 409) {
       console.log("   Obs: O horário já estava ocupado! (Proteção ativa)");
    }
  }

  // GET Request (Verificar slots ocupados)
  console.log('\n2️⃣ Verificando Memória do Banco de Dados (API GET)...');
  const getRes = await fetch(API_URL);
  const getData = await getRes.json();

  if (getData.appointments) {
    console.log(`📡 Retornou ${getData.appointments.length} horários ocupados.`);
    const novoAgendamentoEstaLa = getData.appointments.some((apt: any) => 
       apt.start_time === startTime.toISOString()
    );
    if (novoAgendamentoEstaLa) {
        console.log("✅ O novo agendamento já aparece na lista bloqueada para o Front-End!");
    } else {
        console.log("⚠️ O agendamento não apareceu na lista, verificações pendentes.");
    }
  } else {
    console.error("❌ Falha ao buscar lista de horários ocupados.");
  }

  console.log("\n🏁 Teste Fim-a-Fim Concluído.");
}

testFullFlow();
