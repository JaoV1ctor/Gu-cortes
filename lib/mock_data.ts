// ==========================================
// Este arquivo agora apenas gera a lógica estrutural da agenda.
// Os Serviços não estão mais aqui, pois agora vêm vivos do Backend Supabase!
// ==========================================

export type TimeSlot = {
  time: string;
  available: boolean;
};

export type DaySchedule = {
  date: string; // ISO string ou YYYY-MM-DD
  slots: TimeSlot[];
};

// Gera dados de dias para a Agenda
const generateSchedule = (): DaySchedule[] => {
  const schedule: DaySchedule[] = [];
  const today = new Date();

  // Olhando até 1 Ano para frente (para exibir o calendário lindo)
  // Mas a regra de negócio do Gu Nunes diz que só podem agendar no máximo até 30 dias.
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();
  
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    // Ignora Domingo (0) - A Barbearia funciona de Segunda (1) a Sábado (6)
    if (currentDate.getDay() === 0) {
      continue;
    }

    // Regra: Não pode agendar datas que extrapolarem 30 dias a partir de hoje
    const isBeyondPermittedWindow = i > 30;

    // Horários Base Reais de Serviço (09h00 às 18h00 - exemplo pulando 12h)
    const baseTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    const slots: TimeSlot[] = baseTimes.map(timeStr => {
      let available = true;
      
      // Bloqueio 1: Se for daqui a mais de 30 dias, é impossível de agendar.
      if (isBeyondPermittedWindow) {
        available = false;
      }

      // Bloqueio 2: Se o dia for HOJE (i === 0), barrar horários que a relógio local já bateu/passou.
      // Ex: a request foi 10:10, o slot 10:00 deve secar.
      if (i === 0) {
        const [slotHour, slotMin] = timeStr.split(':').map(Number);
        // Exemplo exigencia: São 10:10 -> 10 é igual, 10 minutos > 00 minutos. Perde o slot das 10h.
        if (currentHour > slotHour || (currentHour === slotHour && currentMinutes > slotMin)) {
          available = false;
        }
      }

      return { time: timeStr, available };
    });

    // Aqui resolvemos problema de Fuso horário pegando data exata no BR
    const dateStr = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];

    schedule.push({
      date: dateStr,
      slots,
    });
  }

  return schedule;
};

// Exporta as datas geradas
export const mockSchedule = generateSchedule();

// Types limpos para o Typescript
export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  icon: 'scissors' | 'beard' | 'combo';
};
