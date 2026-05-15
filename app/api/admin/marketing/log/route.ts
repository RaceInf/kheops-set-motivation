import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { orderId, email, customerName, whatsappNumber, productName, eventType } = await req.json();

    if (!orderId || !eventType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error } = await supabase
      .from('webhook_events')
      .insert([{
        provider: 'tara',
        event_type: `marketing_${eventType}`,
        payload: { 
          orderId, 
          email, 
          customerName,
          whatsappNumber,
          productName,
          sentAt: new Date().toISOString(),
          manual: true 
        },
        status: 'PROCESSED'
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
