import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

import { supabase } from '@/lib/supabase';

// GCal Init
const CALENDAR_ID = (process.env.GOOGLE_CALENDAR_ID || 'primary').trim();

async function getCalendarClient() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is missing.');
  }
  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  const client = await auth.getClient();
  return google.calendar({ version: 'v3', auth: client as any });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { client_name, client_phone, service_id, start_time, end_time } = body;

    if (!client_name || !start_time || !end_time) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 });
    }

    // ----------------------------------------------------
    // VALIDAÇÃO PRIMÁRIA: Supabase + btree_gist Constraint
    // ----------------------------------------------------
    // Ao inserir no Supabase, se o horário conflitar (&& overlap), 
    // a nossa Constraint PostgreSQL irá disparar um Erro fatal imeditamente, negando o agendamento.
    const { data: dbData, error: dbError } = await supabase
      .from('appointments')
      .insert([
        {
          client_name,
          client_phone,
          service_id,
          start_time,
          end_time,
          status: 'confirmed'
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Código de erro de Constraint Exclude (overlap) no PostgreSQL geralmente é 23P01.
      return NextResponse.json({ 
        error: 'Horário Indisponível. Alguém agendou exatamente no mesmo segundo que você!',
        details: dbError.message 
      }, { status: 409 }); 
    }

    // ----------------------------------------------------
    // VALIDAÇÃO SECUNDÁRIA: Inserção Google Calendar
    // ----------------------------------------------------
    let googleEventId = null;
    try {
      const calendar = await getCalendarClient();
      const event = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: {
          summary: `💈 Gu Cortes: ${service_id.toUpperCase()} - ${client_name}`,
          description: `Cliente: ${client_name}\nWhatsApp: ${client_phone}\nServiço: ${service_id}`,
          start: { dateTime: start_time },
          end: { dateTime: end_time },
          colorId: '5' // Amarelo
        }
      });
      googleEventId = event.data.id;
      
      // Atualiza no banco o ID do google
      await supabase.from('appointments').update({ google_event_id: googleEventId }).eq('id', dbData.id);

    } catch (gcalError: any) {
      // Se falhar o Google, deveríamos fazer rollback no Supabase. Para simplificar no protótipo, apenas deletamos:
      await supabase.from('appointments').delete().eq('id', dbData.id);
      return NextResponse.json({ error: 'Erro de sincronia com a agenda externa', message: gcalError.message }, { status: 502 });
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Agendamento Confirmado!', 
        appointment: { ...dbData, google_event_id: googleEventId } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Falha Crítica do Servidor', message: error.message }, { status: 500 });
  }
}

// Retorna os agendamentos ativos
export async function GET(req: Request) {
  try {
    const today = new Date().toISOString();
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, client_name, client_phone, service_id, start_time, end_time, status, google_event_id')
      .gte('start_time', today)
      .eq('status', 'confirmed')
      .order('start_time', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json({ appointments: appointments || [] });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao buscar disponibilidade' }, { status: 500 });
  }
}

// Exclui/Cancela um agendamento do Banco (E idealmente do Google)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    // Pega o google_id antes pra tentar cancelar la tambem
    const { data: aptData } = await supabase.from('appointments').select('google_event_id').eq('id', id).single();

    if (aptData?.google_event_id) {
       try {
         const calendar = await getCalendarClient();
         await calendar.events.delete({
           calendarId: CALENDAR_ID,
           eventId: aptData.google_event_id
         });
       } catch (gcalErr) {
         console.warn("Não foi possível excluir do Gcal (Vencido ou ja excluido manualmente).", gcalErr);
       }
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao cancelar agendamento' }, { status: 500 });
  }
}
