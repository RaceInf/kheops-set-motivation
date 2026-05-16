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

        // Un proxy_opened (Gmail) est souvent le SEUL signal d'ouverture
        // qu'on recevra. On génère donc un vrai "opened" en parallèle.
        if (eventType === 'proxy_opened' && messageId) {
          const { data: existingOpen } = await supabase
            .from('email_events')
            .select('id')
            .eq('message_id', messageId)
            .eq('event_type', 'opened')
            .limit(1);

          if (!existingOpen || existingOpen.length === 0) {
            await supabase.from('email_events').insert([{
              email: email || 'unknown',
              event_type: 'opened',
              message_id: messageId,
              order_id: orderId,
              campaign_tag: campaignTag,
              subject: subject || null,
              timestamp: eventTimestamp,
              metadata: { ...brevoEvent, auto_inferred: true, source: 'inferred_from_proxy_open' },
            }]);
            results.push({ event: 'opened', email, status: 'auto_inferred_from_proxy' });
          }
        }

        // Un clic implique toujours une ouverture.
        // Gmail bloque souvent le pixel de tracking, donc on génère
        // automatiquement un événement "opened" si aucun n'existe.
        if (eventType === 'clicked' && messageId) {
          const { data: existingOpen } = await supabase
            .from('email_events')
            .select('id')
            .eq('message_id', messageId)
            .eq('event_type', 'opened')
            .limit(1);

          if (!existingOpen || existingOpen.length === 0) {
            // On date l'ouverture ~8s AVANT le clic pour qu'elle
            // apparaisse distinctement dans le journal chronologique.
            const openedTimestamp = new Date(new Date(eventTimestamp).getTime() - 8000).toISOString();
            await supabase.from('email_events').insert([{
              email: email || 'unknown',
              event_type: 'opened',
              message_id: messageId,
              order_id: orderId,
              campaign_tag: campaignTag,
              subject: subject || null,
              timestamp: openedTimestamp,
              metadata: { ...brevoEvent, auto_inferred: true, source: 'inferred_from_click' },
            }]);
            results.push({ event: 'opened', email, status: 'auto_inferred_from_click' });
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    console.error('Brevo Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
