import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Normalise les noms d'événements Brevo vers un format cohérent
 */
function normalizeEventType(event: string): string {
  const map: Record<string, string> = {
    'request': 'sent',
    'delivered': 'delivered',
    'opened': 'opened',
    'unique_opened': 'opened',
    'click': 'clicked',
    'hard_bounce': 'hard_bounce',
    'soft_bounce': 'soft_bounce',
    'blocked': 'blocked',
    'spam': 'spam',
    'complaint': 'spam',
    'unsubscribe': 'unsubscribed',
    'unsubscribed': 'unsubscribed',
    'error': 'error',
    'deferred': 'deferred',
    'invalid': 'invalid',
    'proxy_open': 'proxy_opened',
    'loadedbyproxy': 'proxy_opened',
  };
  return map[event?.toLowerCase()] || event?.toLowerCase() || 'unknown';
}

/**
 * Extrait l'orderId des tags Brevo (format: order_xxx)
 */
function extractOrderId(tags: string[]): string | null {
  if (!tags || !Array.isArray(tags)) return null;
  const orderTag = tags.find((t: string) => typeof t === 'string' && t.startsWith('order_'));
  return orderTag ? orderTag.replace('order_', '') : null;
}

/**
 * Extrait le campaign tag des tags Brevo (format: marketing_xxx)
 */
function extractCampaignTag(tags: string[]): string | null {
  if (!tags || !Array.isArray(tags)) return null;
  const campaignTag = tags.find((t: string) => typeof t === 'string' && t.startsWith('marketing_'));
  return campaignTag || null;
}

/**
 * Détermine la raison de l'échec à partir du payload Brevo
 */
function extractReason(brevoEvent: any): string | null {
  return brevoEvent.reason || brevoEvent.error_reason || brevoEvent.comment || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Brevo peut envoyer un seul événement ou un tableau
    const events = Array.isArray(body) ? body : [body];
    const results = [];

    for (const brevoEvent of events) {
      const {
        event,
        email,
        tags,
        subject,
        link,
        date,
        ts_event,
        ts_epoch,
      } = brevoEvent;

      const messageId = brevoEvent['message-id'] || brevoEvent.message_id || null;
      const eventType = normalizeEventType(event);
      const orderId = extractOrderId(tags);
      const campaignTag = extractCampaignTag(tags);
      const reason = extractReason(brevoEvent);
      const linkUrl = link || brevoEvent.url || null;

      // Timestamp: utiliser ts_epoch (ms) > ts_event (s) > date > now
      let eventTimestamp: string;
      if (ts_epoch) {
        eventTimestamp = new Date(ts_epoch).toISOString();
      } else if (ts_event) {
        eventTimestamp = new Date(ts_event * 1000).toISOString();
      } else if (date) {
        eventTimestamp = new Date(date).toISOString();
      } else {
        eventTimestamp = new Date().toISOString();
      }

      // Check for duplicate (if messageId is present)
      let isDuplicate = false;
      if (messageId) {
        const { data: existing } = await supabase
          .from('email_events')
          .select('id')
          .eq('message_id', messageId)
          .eq('event_type', eventType)
          .limit(1);
        
        if (existing && existing.length > 0) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        results.push({ event: eventType, email, status: 'ignored_duplicate' });
        continue;
      }

      // Insert new event
      const { error } = await supabase.from('email_events').insert([{
        email: email || 'unknown',
        event_type: eventType,
        message_id: messageId,
        order_id: orderId,
        campaign_tag: campaignTag,
        reason: reason,
        link_url: linkUrl,
        subject: subject || null,
        timestamp: eventTimestamp,
        metadata: brevoEvent,
      }]);

      if (error) {
        console.error('Email event insert error:', error);
        results.push({ event: eventType, email, error: error.message });
      } else {
        results.push({ event: eventType, email, status: 'ok' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    console.error('Brevo Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
