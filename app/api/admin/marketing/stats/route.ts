import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Récupérer les événements email (nouvelle table dédiée)
    let emailEvents: any[] = [];
    try {
      const { data, error: emailError } = await supabase
        .from('email_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (!emailError) emailEvents = data || [];
    } catch {
      // Table may not exist yet — graceful fallback
    }

    // 2. Récupérer les relances envoyées (webhook_events existante)
    const { data: reminderEvents, error: reminderError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('provider', 'tara')
      .ilike('event_type', 'marketing_reminder_%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (reminderError) throw reminderError;

    // 3. Récupérer les relances WhatsApp
    const { data: whatsappEvents, error: whatsappError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('provider', 'tara')
      .eq('event_type', 'marketing_whatsapp_relance')
      .order('created_at', { ascending: false })
      .limit(20);

    if (whatsappError) throw whatsappError;

    // 4. Calculer les compteurs depuis email_events
    const allEmailEvents = emailEvents || [];
    
    const totalSent = allEmailEvents.filter(e => e.event_type === 'sent').length;
    const totalDelivered = allEmailEvents.filter(e => e.event_type === 'delivered').length;
    const totalOpened = allEmailEvents.filter(e => e.event_type === 'opened').length;
    const totalClicked = allEmailEvents.filter(e => e.event_type === 'clicked').length;
    const totalBounced = allEmailEvents.filter(e => ['hard_bounce', 'soft_bounce'].includes(e.event_type)).length;
    const totalErrors = allEmailEvents.filter(e => ['error', 'blocked', 'spam', 'invalid', 'deferred'].includes(e.event_type)).length;

    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
    const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0;

    // 5. Commandes en séquence
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total_amount')
      .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const pendingSequence = (orders || []).filter(o => o.status === 'PENDING').length;
    const totalAbandoned = (orders || [])
      .filter(o => o.status === 'PENDING')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const totalRecovered = (orders || [])
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.total_amount, 0);

    // 6. Unifier et trier tous les événements chronologiquement
    const unifiedEvents = [
      // Événements email (email_events) — exclure les proxy_opened (pré-chargement Gmail)
      ...allEmailEvents
        .filter(e => e.event_type !== 'proxy_opened')
        .map(e => ({
          id: e.id,
          date: e.timestamp,
          eventType: e.event_type,
          source: 'brevo' as const,
          status: ['hard_bounce', 'soft_bounce', 'error', 'blocked', 'spam', 'invalid', 'deferred'].includes(e.event_type)
            ? 'FAILED'
            : 'PROCESSED',
          payload: {
            email: e.email,
            orderId: e.order_id,
            campaignTag: e.campaign_tag,
            reason: ['hard_bounce', 'soft_bounce', 'error', 'blocked', 'spam', 'invalid', 'deferred'].includes(e.event_type) ? e.reason : null,
            linkUrl: e.link_url,
            subject: e.subject,
            messageId: e.message_id,
          },
        })),
      // Relances envoyées (webhook_events)
      ...(reminderEvents || []).map(e => ({
        id: e.id,
        date: e.created_at,
        eventType: e.event_type.replace('marketing_', ''),
        source: 'system' as const,
        status: e.status,
        payload: e.payload,
      })),
      // WhatsApp (webhook_events)
      ...(whatsappEvents || []).map(e => ({
        id: e.id,
        date: e.created_at,
        eventType: 'whatsapp_relance',
        source: 'system' as const,
        status: e.status,
        payload: e.payload,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalErrors,
      openRate,
      clickRate,
      pendingSequence,
      totalAbandoned,
      totalRecovered,
      emailsSent: (reminderEvents || []).length,
      whatsappClicks: (whatsappEvents || []).length,
    };

    return NextResponse.json({ events: unifiedEvents, stats });

  } catch (error: any) {
    console.error('Marketing Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
