import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { taraProvider } from '@/lib/payments/tara';

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

    if (!paymentEvent.orderId) {
      // If we couldn't map an orderId, we can't process it.
      if (webhookEvent) {
        await supabase.from('webhook_events').update({ 
          status: 'FAILED', 
          error_message: 'No orderId found in payload' 
        }).eq('id', webhookEvent.id);
      }
      return NextResponse.json({ error: 'Unprocessable Entity: Missing orderId' }, { status: 422 });
    }

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
      // Use a transaction or sequential updates. 
      // Supabase JS doesn't do true transactions from edge, so we update sequentially.
      
      // Update Payment Record
      await supabase
        .from('payments')
        .update({ 
          status: 'SUCCESS', 
          provider_reference: paymentEvent.providerReference 
        })
        .eq('order_id', order.id);

      // Update Order Record
      await supabase
        .from('orders')
        .update({ status: 'PAID' })
        .eq('id', order.id);

      // TODO: Trigger fulfillment here (e.g. send email with product link)
      // For resilience, this should ideally be pushed to a queue (e.g. retry_jobs table)
      // await supabase.from('retry_jobs').insert([{ type: 'send_fulfillment_email', order_id: order.id }])

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
