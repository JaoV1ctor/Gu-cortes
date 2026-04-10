import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true }); // Ordenar pelo mais barato ou criacao

    if (error) throw error;
    
    return NextResponse.json({ services: services || [] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao listar serviços', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Geração de ID simples (minúsculo e sem espaço)
    const newId = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);

    const { data, error } = await supabase
      .from('services')
      .insert([{
        id: newId,
        name: body.name,
        price: body.price,
        durationMinutes: body.durationMinutes,
        description: body.description,
        icon: body.icon || 'scissors'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao criar serviço', message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from('services')
      .update({
        name: body.name,
        price: body.price,
        durationMinutes: body.durationMinutes,
        description: body.description,
        icon: body.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao atualizar serviço', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao deletar serviço', message: error.message }, { status: 500 });
  }
}
