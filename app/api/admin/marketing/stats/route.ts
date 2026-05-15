import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Récupérer tous les événements marketing (webhook_events filtrés)
    const { data: events, error: eventsError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('provider', 'tara')
      .ilike('event_type', 'marketing_%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (eventsError) throw eventsError;

    // 2. Calculer les statistiques de récupération
    // On récupère les commandes PENDING et PAID pour calculer les ratios
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 derniers jours

    if (ordersError) throw ordersError;

    const totalAbandoned = (orders || [])
      .filter(o => o.status === 'PENDING')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalRecovered = (orders || [])
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.total_amount, 0);
      
    const recoveryRate = totalAbandoned > 0 
      ? Math.round((totalRecovered / (totalAbandoned + totalRecovered)) * 100) 
      : 0;

    const stats = {
      totalAbandoned,
      totalRecovered,
      recoveryRate,
      emailsSent: (events || []).filter(e => e.event_type.startsWith('marketing_reminder_')).length,
      whatsappClicks: (events || []).filter(e => e.event_type === 'marketing_whatsapp_relance').length,
      pendingSequence: (orders || []).filter(o => o.status === 'PENDING').length
    };

    return NextResponse.json({
      events: (events || []).map(e => ({
        id: e.id,
        date: e.created_at,
        eventType: e.event_type.replace('marketing_', ''),
        status: e.status,
        error_message: e.error_message,
        payload: e.payload
      })),
      stats
    });

  } catch (error: any) {
    console.error('Marketing Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
