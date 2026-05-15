import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Brevo envoie parfois un tableau d'événements
    const events = Array.isArray(body) ? body : [body];

    for (const brevoEvent of events) {
      const { event, email, tags, status } = brevoEvent;
      
      // On cherche le tag order_ID
      const orderTag = (tags || []).find((t: string) => t.startsWith('order_'));
      if (!orderTag) continue;

      const orderId = orderTag.replace('order_', '');

      // On log cet événement dans webhook_events
      // On mappe les événements Brevo vers nos statuts
      let mappedStatus = 'PROCESSED';
      if (event === 'opened') mappedStatus = 'OPENED';
      if (event === 'request' || event === 'delivered') mappedStatus = 'DELIVERED';
      if (event === 'click') mappedStatus = 'CLICKED';
      if (event === 'deferred' || event === 'soft_bounce' || event === 'hard_bounce' || event === 'error') {
        mappedStatus = 'FAILED';
      }

      await supabase.from('webhook_events').insert([{
        provider: 'tara',
        event_type: `marketing_brevo_${event}`,
        payload: { 
          orderId, 
          email, 
          brevoEvent: event,
          brevoStatus: status,
          receivedAt: new Date().toISOString()
        },
        status: mappedStatus
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Brevo Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
