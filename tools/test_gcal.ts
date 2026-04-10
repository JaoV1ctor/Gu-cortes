import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// ==========================================
// 03: Ping Google Calendar (Fase Link)
// ==========================================

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function pingCalendar() {
  console.log("🔥 Testando autenticação Service Account (Google Calendar)...");

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`❌ ERRO: Arquivo 'credentials.json' NÃO encontrado na raiz do projeto (${CREDENTIALS_PATH}).`);
    console.error("Favor gerar o arquivo no Google Cloud Console e adicioná-lo ao diretório.");
    process.exit(1);
  }

  try {
    // Escopos de permissão necessários (leitura e escrita nos eventos)
    const SCOPES = ['https://www.googleapis.com/auth/calendar'];
    
    // Instancia o cliente auth baseado no arquivo JSON local da Service Account
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: SCOPES,
    });

    const client = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: client as any });
    
    // Vamos testar acesso ao calendário primário fazendo uma chamada simples (listando apenas 1 evento recente/futuro)
    // OBS: O calendário alvo tem que ser explicitamente compartilhado (via interface web do Google Calendar)
    // para o email (client_email) contido dentro do credentials.json, caso contrário será "Not Found".
    // Para simplificar o PING, testaremos acessar os próprios calendários da Service Account.
    
    const res = await calendar.calendarList.list({
      maxResults: 1
    });

    console.log("✅ Sucesso! Conectado à conta Service Account.");
    console.log(`✅ IDs de Calendário Ativos: ${res.data.items?.map(c => c.id).join(', ') || 'Nenhum'}`);
    console.log("-----------------------------------------------------");
    console.log("⚠️ AVISO: Lembre-se de ir no seu Google Agenda Pessoal, clicar e 'Compartilhar' seu calendário (com Gerenciar Eventos) para o 'client_email' que está dentro do credentials.json.");
    
  } catch (error: any) {
    console.error("❌ Falha na conexão ou autenticação. Detalhes:");
    console.error(error.message);
    process.exit(1);
  }
}

pingCalendar();
