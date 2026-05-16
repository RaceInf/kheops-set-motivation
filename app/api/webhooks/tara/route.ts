import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { taraProvider } from '@/lib/payments/tara';
import { deliverProductByEmail } from '@/lib/fulfillment';

export async function POST(req: Request) {
  try {
    // 1. Read raw body for validation
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 2. Validate Signature
    // We recreate a request object with the parsed json to pass to the provider
    const validationReq = new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: rawBody
    });

    const validation = await taraProvider.verifyWebhookSignature(validationReq);
    
    if (!validation.isValid) {
      console.error('Webhook signature validation failed:', validation.error);
      return NextResponse.json({ error: 'Unauthorized: Invalid signature' }, { status: 401 });
    }

    // 3. Log the Webhook Event (Idempotency and Audit)
    // We log it as PENDING. If it fails processing later, we have a trace.
    const { data: webhookEvent, error: webhookError } = await supabase
      .from('webhook_events')
      .insert([{
        provider: 'tara',
        event_type: payload.type || 'payment.update',
        payload: payload,
        status: 'PENDING'
      }])
      .select('id')
      .single();

    if (webhookError || !webhookEvent) {
      console.error('Failed to log webhook event:', webhookError);
      // We continue processing even if logging fails, but it's risky for idempotency.
    }

    // 4. Parse the Payload
    const paymentEvent = taraProvider.parseWebhookPayload(payload);

    // Si l'orderId n'est pas dans le body, on le récupère dans l'URL (query param)
    const url = new URL(req.url);
    const orderIdFromUrl = url.searchParams.get('orderId');
    const orderId = paymentEvent.orderId || orderIdFromUrl;

    if (!orderId) {
      // If we couldn't map an orderId, we can't process it.
      if (webhookEvent) {
        await supabase.from('webhook_events').update({ 
          status: 'FAILED', 
          error_message: 'No orderId found in payload or URL' 
        }).eq('id', webhookEvent.id);
      }
      return NextResponse.json({ error: 'Unprocessable Entity: Missing orderId' }, { status: 422 });
    }

    // On s'assure que paymentEvent a le bon orderId pour la suite
    paymentEvent.orderId = orderId;

    // 5. Check Idempotency (Has this order already been paid?)
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('status, id')
      .eq('id', paymentEvent.orderId)
      .single();

    if (orderFetchError || !order) {
      if (webhookEvent) {
        await supabase.from('webhook_events').update({ 
          status: 'FAILED', 
          error_message: 'Order not found in DB' 
        }).eq('id', webhookEvent.id);
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      // Idempotent success: Already paid, do nothing but return 200 OK so provider stops retrying
      if (webhookEvent) {
        await supabase.from('webhook_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', webhookEvent.id);
      }
      return NextResponse.json({ success: true, message: 'Order already paid' });
    }

    // 6. Update Payment and Order status
    if (paymentEvent.status === 'SUCCESS') {
      // Protection race condition : on met à jour uniquement si status est encore PENDING.
      // Deux webhooks simultanés ne pourront pas tous les deux passer ce filtre.
      const { data: updatedRows, error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'PAID' })
        .eq('id', order.id)
        .eq('status', 'PENDING')
        .select('id');

      if (orderUpdateError || !updatedRows || updatedRows.length === 0) {
        // Un autre webhook a déjà traité cette commande (race condition bloquée)
        if (webhookEvent) {
          await supabase.from('webhook_events').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', webhookEvent.id);
        }
        return NextResponse.json({ success: true, message: 'Order already processed (concurrent webhook)' });
      }

      // Update Payment Record
      await supabase
        .from('payments')
        .update({
          status: 'SUCCESS',
          provider_reference: paymentEvent.providerReference
        })
        .eq('order_id', order.id);

      // --- LIVRAISON PAR EMAIL (BREVO) ---
      await deliverProductByEmail(order.id);
      // -----------------------------------

    } else if (paymentEvent.status === 'FAILED') {
      await supabase
        .from('payments')
        .update({ 
          status: 'FAILED', 
          provider_reference: paymentEvent.providerReference,
          error_message: 'Payment failed according to webhook'
        })
        .eq('order_id', order.id);
        
      await supabase
        .from('orders')
        .update({ status: 'FAILED' })
        .eq('id', order.id);
    }

    // 7. Mark Webhook as Processed
    if (webhookEvent) {
      await supabase.from('webhook_events').update({ 
        status: 'PROCESSED',
        processed_at: new Date().toISOString()
      }).eq('id', webhookEvent.id);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
