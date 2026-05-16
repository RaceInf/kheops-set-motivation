import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deliverProductByEmail } from '@/lib/fulfillment';

/**
 * CRON : Retry automatique des livraisons email échouées.
 *
 * Trouve toutes les commandes PAID dont delivery_status != 'SENT'
 * et tente de renvoyer l'email de livraison.
 *
 * Fréquence conseillée : toutes les heures (même cron que les relances marketing).
 * Appel : GET /api/admin/cron/delivery-retry?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Commandes payées mais non livrées (PENDING ou FAILED), créées il y a moins de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: undelivered, error } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'PAID')
      .neq('delivery_status', 'SENT')
      .gt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
    if (!undelivered || undelivered.length === 0) {
      return NextResponse.json({ message: 'No undelivered orders', retried: 0 });
    }

    const results: { orderId: string; success: boolean }[] = [];

    for (const order of undelivered) {
      const success = await deliverProductByEmail(order.id);
      results.push({ orderId: order.id, success });
    }

    const succeeded = results.filter(r => r.success).length;
    console.log(`[delivery-retry] ${succeeded}/${results.length} livraisons réussies`);

    return NextResponse.json({
      retried: results.length,
      succeeded,
      failed: results.length - succeeded,
      details: results,
    });
  } catch (err: any) {
    console.error('[delivery-retry] Erreur cron:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
