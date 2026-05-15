import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { taraProvider } from '@/lib/payments/tara';
import { tools } from '@/lib/data';
import { 
  sendMarketingReminderH1, 
  sendMarketingReminderH24, 
  sendMarketingReminderH72,
  sendMarketingAdminNotification
} from '@/lib/email';

/**
 * API CRON : Envoi automatique des relances marketing
 * Fréquence conseillée : Toutes les heures
 */
export async function GET(req: Request) {
  // Optionnel : Vérifier une clé secrète pour éviter les appels non autorisés
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // 1. Récupérer les commandes en attente des 4 derniers jours
    const fourDaysAgo = new Date(now);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        customer_name,
        whatsapp_number,
        users (email),
        order_items (product_id)
      `)
      .eq('status', 'PENDING')
      .gt('created_at', fourDaysAgo.toISOString());

    if (fetchError) throw fetchError;
    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ message: 'No pending orders to process' });
    }

    const results = [];

    for (const order of pendingOrders) {
      const createdAt = new Date(order.created_at);
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const customerEmail = (order.users as any)?.email;
      const productId = (order.order_items as any)?.[0]?.product_id;
      const tool = tools.find(t => t.id === productId);

      if (!customerEmail || !tool) continue;

      // Vérifier quels rappels ont déjà été envoyés pour cette commande
      // On utilise la table webhook_events comme log (type marketing_reminder)
      const { data: sentLogs } = await supabase
        .from('webhook_events')
        .select('event_type')
        .eq('provider', 'tara')
        .ilike('event_type', 'marketing_reminder%')
        .filter('payload->>orderId', 'eq', order.id);

      const sentTypes = sentLogs?.map(l => l.event_type.replace('marketing_', '')) || [];

      let reminderSent = null;
      let errorOccurred = null;

      // Logique des intervalles (1h, 24h, 72h)
      try {
        if (hoursElapsed >= 1 && hoursElapsed < 24 && !sentTypes.includes('reminder_h1')) {
          const checkoutUrl = await getCheckoutUrl(order, tool);
          await sendMarketingReminderH1(customerEmail, tool.title, checkoutUrl, order.id);
          reminderSent = 'marketing_reminder_h1';
        } 
        else if (hoursElapsed >= 24 && hoursElapsed < 72 && !sentTypes.includes('reminder_h24')) {
          const checkoutUrl = await getCheckoutUrl(order, tool);
          await sendMarketingReminderH24(customerEmail, tool.title, checkoutUrl, order.id);
          reminderSent = 'marketing_reminder_h24';
        }
        else if (hoursElapsed >= 72 && !sentTypes.includes('reminder_h72')) {
          const checkoutUrl = await getCheckoutUrl(order, tool);
          await sendMarketingReminderH72(customerEmail, tool.title, checkoutUrl, order.id);
          reminderSent = 'marketing_reminder_h72';
        }
      } catch (err: any) {
        console.error(`Failed to send reminder to ${customerEmail}:`, err);
        errorOccurred = err.message;
        reminderSent = hoursElapsed >= 72 ? 'marketing_reminder_h72' : hoursElapsed >= 24 ? 'marketing_reminder_h24' : 'marketing_reminder_h1';
      }

      if (reminderSent) {
        // Logger l'envoi dans webhook_events (existant)
        await supabase.from('webhook_events').insert([{
          provider: 'tara',
          event_type: reminderSent,
          payload: { 
            orderId: order.id, 
            sentAt: new Date().toISOString(), 
            email: customerEmail,
            customerName: order.customer_name,
            whatsappNumber: order.whatsapp_number,
            productName: tool.title,
            error: errorOccurred
          },
          status: errorOccurred ? 'FAILED' : 'PROCESSED'
        }]);

        // Logger aussi dans email_events (nouveau tracking)
        if (!errorOccurred) {
          await supabase.from('email_events').insert([{
            email: customerEmail,
            event_type: 'sent',
            order_id: order.id,
            campaign_tag: reminderSent,
            subject: `[KSM] Relance ${reminderSent.replace('marketing_reminder_', '').toUpperCase()}`,
            timestamp: new Date().toISOString(),
            metadata: { productName: tool.title, customerName: order.customer_name }
          }]);
        }

        if (!errorOccurred) {
          // Notification Admin uniquement si succès
          try {
            const type = reminderSent.replace('marketing_reminder_', '');
            await sendMarketingAdminNotification(customerEmail, tool.title, type);
          } catch (adminErr) {
            console.error('Admin notification failed:', adminErr);
          }
          results.push({ orderId: order.id, type: reminderSent });
        }
      }
    }

    return NextResponse.json({ 
      processed: pendingOrders.length, 
      sent: results.length,
      details: results 
    });

  } catch (error: any) {
    console.error('Marketing Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Génère ou récupère un lien de paiement pour la relance
 */
async function getCheckoutUrl(order: any, tool: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';
  
  // On régénère un lien frais via Tara
  const paymentResponse = await taraProvider.createPaymentLink({
    orderId: order.id,
    productId: tool.id,
    productName: tool.title,
    productPrice: order.total_amount,
    productDescription: tool.desc,
    productPictureUrl: `${baseUrl}${tool.image}`,
    userEmail: order.users.email
  });

  return paymentResponse.paymentUrl || `${baseUrl}/arsenal/${tool.id}`;
}
